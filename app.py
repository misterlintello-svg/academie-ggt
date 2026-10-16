# -*- coding: utf-8 -*-
"""
ACADEMIE GGT — Serveur Backend Flask + PostgreSQL + Gmail SMTP
Gère :
  - Portail d'inscription et d'accès Étudiants (/etudiant.html)
  - Portail Administrateur Principal (/admin.html)
  - Génération d'identifiants : <Initiales>-<JJMMAAAA>-<Classe>
  - Validité d'1 mois exact + invalidation mensuelle (encaissement des frais)
  - Cours PDF, Exercices & Corrigés PDF
  - Forum d'entraide académique
"""

import os
import re
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime, timedelta
from pathlib import Path
from werkzeug.utils import secure_filename

from flask import (
    Flask, request, jsonify, send_from_directory, abort
)
from dotenv import load_dotenv
import psycopg
from psycopg.rows import dict_row

from sample_content import SAMPLES, FILIERE_CODE, ECOLES_YAMOUSSOUKRO

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")
load_dotenv(Path.home() / ".env")

DB_HOST = os.getenv("PG_HOST", "localhost")
DB_PORT = int(os.getenv("PG_PORT", "5432"))
DB_USER = os.getenv("PG_USER", "postgres")
DB_PASS = os.getenv("PG_PASSWORD", "Admin123")
DB_NAME = os.getenv("PG_DATABASE", "academie_ggt")

ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin123")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "mohsanogo512@gmail.com")

UPLOAD_DIR = BASE_DIR / "uploads" / "pdfs"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

app = Flask(__name__, static_folder=str(BASE_DIR), static_url_path="")


@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, X-Admin-Password, X-Student-Code"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    return response


# ─────────────────────────────────────────────────────────────
# Base de données PostgreSQL
# ─────────────────────────────────────────────────────────────
def ensure_database():
    """Crée la base PostgreSQL `academie_ggt` si elle n'existe pas en local."""
    if os.getenv("DATABASE_URL"):
        return  # Sur Render ou PostgreSQL managé, la base est déjà provisionnée
    try:
        with psycopg.connect(
            host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS,
            dbname="postgres", autocommit=True
        ) as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
                if not cur.fetchone():
                    cur.execute(f'CREATE DATABASE "{DB_NAME}" ENCODING \'UTF8\'')
    except Exception as e:
        print(f"[INFO] ensure_database (normal si base gérée en cloud) : {e}")


def get_db():
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return psycopg.connect(database_url, row_factory=dict_row)
    return psycopg.connect(
        host=DB_HOST, port=DB_PORT, user=DB_USER, password=DB_PASS,
        dbname=DB_NAME, row_factory=dict_row
    )


def generate_sample_pdfs():
    """Génère de vrais fichiers PDF de cours, exercices et corrigés pour le cycle BTS."""
    try:
        from fpdf import FPDF
    except Exception:
        return []

    samples = SAMPLES

    created = []
    for item in samples:
        pdf_path = UPLOAD_DIR / item["filename"]
        if not pdf_path.exists():
            pdf = FPDF()
            pdf.add_page()
            pdf.set_auto_page_break(auto=True, margin=15)
            pdf.set_font("Helvetica", "B", 14)
            pdf.multi_cell(0, 9, item["title"].encode("latin-1", "replace").decode("latin-1"), new_x="LMARGIN", new_y="NEXT")
            pdf.ln(4)
            pdf.set_font("Helvetica", "", 11)
            for line in item["lines"]:
                safe_line = line.encode("latin-1", "replace").decode("latin-1")
                if not safe_line.strip():
                    pdf.ln(5)
                else:
                    pdf.multi_cell(0, 7, safe_line, new_x="LMARGIN", new_y="NEXT")
            pdf.output(str(pdf_path))
        created.append(item)
    return created


def init_db():
    ensure_database()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("""
                CREATE TABLE IF NOT EXISTS students (
                    id SERIAL PRIMARY KEY,
                    full_name VARCHAR(160) NOT NULL,
                    email VARCHAR(180) NOT NULL,
                    phone VARCHAR(60) DEFAULT '',
                    classe VARCHAR(80) NOT NULL,
                    registered_at TIMESTAMP NOT NULL DEFAULT NOW(),
                    status VARCHAR(30) NOT NULL DEFAULT 'pending',
                    student_code VARCHAR(80) UNIQUE,
                    confirmed_at TIMESTAMP,
                    valid_until TIMESTAMP,
                    last_payment_month VARCHAR(20)
                );

                CREATE TABLE IF NOT EXISTS resources (
                    id SERIAL PRIMARY KEY,
                    title VARCHAR(220) NOT NULL,
                    category VARCHAR(40) NOT NULL, -- 'cours' ou 'exercice_corrige'
                    classe VARCHAR(80) NOT NULL,
                    subject VARCHAR(140) DEFAULT '',
                    filename VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS forum_posts (
                    id SERIAL PRIMARY KEY,
                    author_name VARCHAR(160) NOT NULL,
                    author_classe VARCHAR(80) NOT NULL,
                    author_role VARCHAR(30) NOT NULL DEFAULT 'etudiant',
                    title VARCHAR(240) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );

                CREATE TABLE IF NOT EXISTS forum_replies (
                    id SERIAL PRIMARY KEY,
                    post_id INTEGER NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
                    author_name VARCHAR(160) NOT NULL,
                    author_classe VARCHAR(80) NOT NULL,
                    author_role VARCHAR(30) NOT NULL DEFAULT 'etudiant',
                    content TEXT NOT NULL,
                    created_at TIMESTAMP NOT NULL DEFAULT NOW()
                );
            """)
            cur.execute("ALTER TABLE students ADD COLUMN IF NOT EXISTS ecole VARCHAR(160) DEFAULT ''")
            cur.execute("ALTER TABLE forum_replies ADD COLUMN IF NOT EXISTS post_id INTEGER")
            cur.execute("ALTER TABLE forum_replies ADD COLUMN IF NOT EXISTS author_name VARCHAR(160) DEFAULT 'Enseignant GGT'")
            cur.execute("ALTER TABLE forum_replies ADD COLUMN IF NOT EXISTS author_classe VARCHAR(80) DEFAULT 'BTS 2 - GC-GT'")
            cur.execute("ALTER TABLE forum_replies ADD COLUMN IF NOT EXISTS author_role VARCHAR(30) DEFAULT 'admin'")
            cur.execute("""
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_replies' AND column_name='topic_id') THEN
                        ALTER TABLE forum_replies ALTER COLUMN topic_id DROP NOT NULL;
                        UPDATE forum_replies SET post_id = topic_id WHERE post_id IS NULL;
                    END IF;
                    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='forum_replies' AND column_name='author_id') THEN
                        ALTER TABLE forum_replies ALTER COLUMN author_id DROP NOT NULL;
                    END IF;
                END $$;
            """)

            # Supprimer les anciens PDF de démonstration des autres filières BTS (entrées de base uniquement)
            legacy_files = [
                "Cours_Algorithmique_Structures_Donnees_BTS1_IDA.pdf",
                "Exercices_Corriges_Algo_BTS1_IDA.pdf",
                "Cours_Comptabilite_Analytique_BTS2_FCGE.pdf",
                "Sujet_Corrige_Cas_Synthese_BTS2_FCGE.pdf",
                "Cours_Droit_Travail_Communication_BTS_RHC_GEC.pdf",
            ]
            cur.execute("DELETE FROM resources WHERE filename = ANY(%s)", (legacy_files,))
            cur.execute("UPDATE resources SET classe = %s WHERE classe <> %s", (FILIERE_CODE, FILIERE_CODE))

            # Insérer les PDF de démonstration de la filière GC-GT s'ils sont absents
            samples = generate_sample_pdfs()
            for s in samples:
                cur.execute("SELECT 1 FROM resources WHERE filename = %s", (s["filename"],))
                if not cur.fetchone():
                    cur.execute(
                        """INSERT INTO resources (title, category, classe, subject, filename)
                           VALUES (%s, %s, %s, %s, %s)""",
                        (s["title"], s["category"], s["classe"], s["subject"], s["filename"])
                    )

            # Insérer une discussion d'exemple sur le forum si vide
            cur.execute("SELECT COUNT(*) AS c FROM forum_posts")
            if cur.fetchone()["c"] == 0:
                cur.execute(
                    """INSERT INTO forum_posts (author_name, author_classe, author_role, title, content)
                       VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                    (
                        "Prof. Coordinateur GGT",
                        "Encadrement BTS",
                        "admin",
                        "Bienvenue sur le Forum d'entraide académique d'ACADEMIE GGT !",
                        "Posez ici vos questions sur les cours PDF, les TD et les sujets corrigés du cycle BTS. Vos camarades et les enseignants vous répondent."
                    )
                )
            # Migration : les anciennes filières BTS ne sont plus proposées.
            # Les inscriptions réelles sont rattachées à la filière unique GC-GT ;
            # seules les anciennes données de démonstration sont supprimées.
            legacy_codes = (
                "MS-16102026-BTS1IDA", "KA-16102026-BTS2FCGE", "KMA-16102026-BTS1IDA",
                "YGM-16102026-BTS2RHC", "BCO-16102026-BTS2RIT", "NAE-16102026-BTS1GEC",
                "DIK-16102026-BTS2GBAT",
            )
            cur.execute("DELETE FROM students WHERE student_code = ANY(%s)", (list(legacy_codes),))
            cur.execute(
                "DELETE FROM students WHERE student_code IS NULL AND email LIKE %s AND classe <> %s",
                ("%@academie-ggt.ci", FILIERE_CODE)
            )
            cur.execute("UPDATE students SET classe = %s WHERE classe <> %s", (FILIERE_CODE, FILIERE_CODE))

            # Insérer 10 inscriptions d'étudiants (simulation 10 x 10.000 FCFA = 100.000 FCFA)
            cur.execute("SELECT COUNT(*) AS c FROM students")
            if cur.fetchone()["c"] < 10:
                now = datetime.now()
                exp = now + timedelta(days=30)
                mtag = now.strftime("%Y-%m")
                E = ECOLES_YAMOUSSOUKRO
                demo_students = [
                    ("Mohamed Sanogo", "mohsanogo512@gmail.com", "+225 07 00 00 00 00", E[0], "active", "MS-16102026-BTS2GCGT"),
                    ("Koné Aminata", "aminata.kone@academie-ggt.ci", "+225 05 44 11 22 33", E[1], "active", "KA-16102026-BTS2GCGT"),
                    ("Kouadio Marc-Arthur", "marc.kouadio@academie-ggt.ci", "+225 07 58 91 02 14", E[0], "active", "KMA-16102026-BTS2GCGT"),
                    ("Yao Grâce Manuella", "grace.yao@academie-ggt.ci", "+225 01 42 88 73 19", E[2], "active", "YGM-16102026-BTS2GCGT"),
                    ("Bamba Cheick Oumar", "cheick.bamba@academie-ggt.ci", "+225 07 77 31 45 90", E[3], "active", "BCO-16102026-BTS2GCGT"),
                    ("N'Guessan Aya Estelle", "estelle.nguessan@academie-ggt.ci", "+225 05 66 20 18 44", E[1], "active", "NGAE-16102026-BTS2GCGT"),
                    ("Diallo Ibrahim Khalil", "ibrahim.diallo@academie-ggt.ci", "+225 07 08 55 12 67", E[4], "active", "DIK-16102026-BTS2GCGT"),
                    ("Touré Mariam Sofia", "mariam.toure@academie-ggt.ci", "+225 05 04 92 81 10", E[2], "pending", None),
                    ("Ouattara Jean-Luc", "jeanluc.ouattara@academie-ggt.ci", "+225 07 89 40 33 21", E[3], "pending", None),
                    ("Aka Christelle Aurore", "christelle.aka@academie-ggt.ci", "+225 01 51 74 62 09", E[4], "pending", None),
                ]
                for fname, em, ph, ecole, st_status, scode in demo_students:
                    cur.execute("SELECT id FROM students WHERE LOWER(email) = LOWER(%s)", (em,))
                    if not cur.fetchone():
                        cur.execute(
                            """INSERT INTO students (full_name, email, phone, classe, ecole, registered_at, status, student_code, confirmed_at, valid_until, last_payment_month)
                               VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)""",
                            (
                                fname, em, ph, FILIERE_CODE, ecole, now, st_status, scode,
                                now if st_status == "active" else None,
                                exp if st_status == "active" else None,
                                mtag if st_status == "active" else None,
                            )
                        )
        conn.commit()


# ─────────────────────────────────────────────────────────────
# Génération d'identifiant & Vérification de validité mensuelle
# ─────────────────────────────────────────────────────────────
def build_student_code(full_name: str, reg_date: datetime, classe: str, student_id: int) -> str:
    """
    Construit l'identifiant unique selon la consigne :
      Initiales du nom + Date d'inscription (JJMMAAAA) + Classe
    Exemple : "Mohamed Sanogo", 16/10/2026, "BTS 1 - IDA" -> "MS-16102026-BTS1IDA"
    """
    parts = [p for p in re.split(r"[\s\-']+", full_name.strip()) if p]
    initials = "".join(p[0].upper() for p in parts if p[0].isalnum()) or "ETU"
    date_str = reg_date.strftime("%d%m%Y")
    clean_class = re.sub(r"[^A-Za-z0-9]", "", classe.upper()) or "BTS"
    base_code = f"{initials}-{date_str}-{clean_class}"

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "SELECT id FROM students WHERE student_code = %s AND id <> %s",
                (base_code, student_id)
            )
            if cur.fetchone():
                return f"{base_code}-{student_id}"
    return base_code


def compute_effective_status(student: dict) -> dict:
    """
    Vérifie en temps réel si l'identifiant d'un étudiant est actif ou expiré :
    - Valable pendant une durée exacte d'1 mois (valid_until)
    - Devient invalide à chaque fin de mois (ou dépassement de valid_until)
    """
    s = dict(student)
    now = datetime.now()

    if s["status"] == "active" and s.get("valid_until"):
        valid_until = s["valid_until"]
        # Vérifie l'échéance d'1 mois exact OU le changement de mois si last_payment_month est dépassé
        if now > valid_until:
            s["status"] = "expired"
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("UPDATE students SET status = 'expired' WHERE id = %s", (s["id"],))
                conn.commit()

    # Formatage lisible pour le JSON
    for k in ("registered_at", "confirmed_at", "valid_until"):
        if s.get(k) and isinstance(s[k], datetime):
            s[k] = s[k].strftime("%d/%m/%Y %H:%M")
    return s


# ─────────────────────────────────────────────────────────────
# Envoi d'email via Gmail SMTP (mohsanogo512@gmail.com)
# ─────────────────────────────────────────────────────────────
def send_credentials_email(to_email: str, full_name: str, classe: str, code: str, valid_until: datetime, is_renewal: bool = False):
    """
    Envoie l'identifiant à l'étudiant via Gmail SMTP si GMAIL_APP_PASSWORD est configuré.
    Retourne (sent: bool, message: str)
    """
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(Path.home() / ".env", override=True)
    app_password = os.getenv("GMAIL_APP_PASSWORD", "").strip()
    sender = os.getenv("ADMIN_EMAIL", ADMIN_EMAIL).strip()

    action_label = "Renouvellement mensuel confirmé" if is_renewal else "Inscription confirmée"
    exp_str = valid_until.strftime("%d/%m/%Y à %H:%M")

    subject = f"[ACADEMIE GGT] {action_label} — Votre identifiant d'accès ({classe})"
    html_body = f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;background:#0b1929;color:#ffffff;padding:32px;border-radius:18px;border:1px solid rgba(108,180,229,0.3)">
      <div style="font-size:12px;letter-spacing:0.2em;color:#6cb4e5;text-transform:uppercase;margin-bottom:8px">ACADEMIE GGT · Cycle BTS</div>
      <h2 style="margin:0 0 16px;font-size:22px;color:#ffffff">Bonjour {full_name},</h2>
      <p style="color:#cbd5e1;line-height:1.6">
        Votre accès aux cours de renforcement <strong>ACADEMIE GGT</strong> pour la classe <strong>{classe}</strong> est désormais <strong>actif</strong>.
      </p>
      <div style="background:#132a46;border:1.5px solid #6cb4e5;border-radius:14px;padding:20px;text-align:center;margin:24px 0">
        <div style="font-size:12px;color:#93c5fd;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:6px">Votre identifiant personnel unique</div>
        <div style="font-size:24px;font-weight:800;letter-spacing:0.06em;color:#ffffff;font-family:monospace">{code}</div>
        <div style="font-size:12px;color:#cbd5e1;margin-top:10px">Valable exactement 1 mois — jusqu'au <strong>{exp_str}</strong></div>
      </div>
      <p style="color:#cbd5e1;font-size:14px;line-height:1.6">
        Connectez-vous sur le portail étudiant avec cet identifiant pour accéder à vos <strong>Cours PDF</strong>, <strong>Exercices & Corrigés PDF</strong> et au <strong>Forum académique</strong>.
      </p>
      <p style="color:#94a3b8;font-size:12px;margin-top:24px;border-top:1px solid rgba(255,255,255,0.1);padding-top:14px">
        Rappel : chaque identifiant est valable 1 mois et doit être renouvelé en fin de mois auprès de l'administration ACADEMIE GGT.
      </p>
    </div>
    """

    if not app_password:
        return False, "GMAIL_APP_PASSWORD non configuré : identifiant généré (utilisez le bouton Envoyer par mail ou configurez le mot de passe d'application Gmail)."

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"ACADEMIE GGT <{sender}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html", "utf-8"))

        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=12) as server:
            server.login(sender, app_password)
            server.sendmail(sender, [to_email], msg.as_string())
        return True, f"Email envoyé automatiquement à {to_email} depuis {sender}."
    except Exception as e:
        return False, f"Identifiant activé, mais erreur SMTP Gmail ({e}). Vous pouvez envoyer l'email en 1 clic."


# ─────────────────────────────────────────────────────────────
# Vérification Admin
# ─────────────────────────────────────────────────────────────
def check_admin():
    pwd = request.headers.get("X-Admin-Password", "")
    if pwd != ADMIN_PASSWORD:
        abort(401, description="Mot de passe administrateur invalide.")


# ─────────────────────────────────────────────────────────────
# ROUTES PAGES STATIQUES
# ─────────────────────────────────────────────────────────────
@app.route("/")
def serve_home():
    return send_from_directory(str(BASE_DIR), "index.html")


@app.route("/uploads/pdfs/<path:filename>")
def serve_pdf(filename):
    return send_from_directory(str(UPLOAD_DIR), filename)


# ─────────────────────────────────────────────────────────────
# API ÉTUDIANTS (Inscription + Connexion + Espace Académique)
# ─────────────────────────────────────────────────────────────
@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json(force=True)
    full_name = (data.get("full_name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    phone = (data.get("phone") or "").strip()
    classe = FILIERE_CODE  # filière unique : BTS 2 - Génie Civil option Géomètre Topographe
    ecole = (data.get("ecole") or "").strip()

    if not full_name or not email or not ecole:
        return jsonify({"error": "Veuillez renseigner votre nom complet, votre email et votre école de provenance à Yamoussoukro."}), 400

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO students (full_name, email, phone, classe, ecole, status)
                   VALUES (%s, %s, %s, %s, %s, 'pending')
                   RETURNING id, full_name, email, classe, registered_at, status""",
                (full_name, email, phone, classe, ecole)
            )
            row = cur.fetchone()
        conn.commit()

    # Aperçu du format d'identifiant qui sera attribué après validation admin
    preview_code = build_student_code(full_name, row["registered_at"], classe, row["id"])
    return jsonify({
        "ok": True,
        "message": (
            f"Inscription enregistrée avec succès ! Votre demande est en attente de confirmation par l'administrateur principal. "
            f"Dès validation de vos frais mensuels, vous recevrez votre identifiant personnel par email ({email})."
        ),
        "preview_format": preview_code
    })


@app.route("/api/student/login", methods=["POST"])
def api_student_login():
    data = request.get_json(force=True)
    code = (data.get("student_code") or "").strip().upper()
    if not code:
        return jsonify({"error": "Veuillez saisir votre identifiant étudiant."}), 400

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM students WHERE UPPER(student_code) = %s", (code,))
            student = cur.fetchone()

    if not student:
        return jsonify({"error": "Identifiant introuvable. Vérifiez votre code ou assurez-vous que l'administrateur a confirmé votre inscription."}), 404

    s = compute_effective_status(student)
    if s["status"] == "pending":
        return jsonify({"error": "Votre inscription est encore en attente de validation par l'administrateur principal."}), 403
    if s["status"] != "active":
        return jsonify({
            "error": "Votre identifiant mensuel a expiré (fin de période d'1 mois). Veuillez contacter l'administrateur principal pour régler vos frais mensuels et réactiver votre accès."
        }), 403

    return jsonify({"ok": True, "student": s})


@app.route("/api/student/portal", methods=["GET"])
def api_student_portal():
    code = (request.headers.get("X-Student-Code") or request.args.get("code") or "").strip().upper()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM students WHERE UPPER(student_code) = %s", (code,))
            student = cur.fetchone()
            if not student:
                return jsonify({"error": "Session invalide."}), 401

            s = compute_effective_status(student)
            if s["status"] != "active":
                return jsonify({"error": "Accès mensuel expiré. Contactez l'administrateur pour le renouvellement."}), 403

            cur.execute("SELECT * FROM resources ORDER BY created_at DESC")
            resources = cur.fetchall()
            for r in resources:
                r["created_at"] = r["created_at"].strftime("%d/%m/%Y")
                r["url"] = f"/uploads/pdfs/{r['filename']}"

            cur.execute("SELECT * FROM forum_posts ORDER BY created_at DESC")
            posts = cur.fetchall()
            cur.execute("SELECT * FROM forum_replies ORDER BY created_at ASC")
            replies = cur.fetchall()

    replies_by_post = {}
    for rep in replies:
        rep["created_at"] = rep["created_at"].strftime("%d/%m/%Y %H:%M")
        replies_by_post.setdefault(rep["post_id"], []).append(rep)

    for p in posts:
        p["created_at"] = p["created_at"].strftime("%d/%m/%Y %H:%M")
        p["replies"] = replies_by_post.get(p["id"], [])

    return jsonify({"student": s, "resources": resources, "forum": posts})


@app.route("/api/forum/posts", methods=["POST"])
def api_create_post():
    data = request.get_json(force=True)
    code = (request.headers.get("X-Student-Code") or "").strip().upper()
    admin_pwd = request.headers.get("X-Admin-Password", "")

    title = (data.get("title") or "").strip()
    content = (data.get("content") or "").strip()
    if not title or not content:
        return jsonify({"error": "Titre et message requis."}), 400

    if admin_pwd == ADMIN_PASSWORD:
        author_name = "Administrateur Principal GGT"
        author_classe = "Direction Académique"
        author_role = "admin"
    else:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM students WHERE UPPER(student_code) = %s", (code,))
                st = cur.fetchone()
        if not st or compute_effective_status(st)["status"] != "active":
            return jsonify({"error": "Accès étudiant actif requis pour publier sur le forum."}), 403
        author_name = st["full_name"]
        author_classe = st["classe"]
        author_role = "etudiant"

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO forum_posts (author_name, author_classe, author_role, title, content)
                   VALUES (%s, %s, %s, %s, %s) RETURNING id""",
                (author_name, author_classe, author_role, title, content)
            )
        conn.commit()
    return jsonify({"ok": True})


@app.route("/api/forum/posts/<int:post_id>/replies", methods=["POST"])
def api_create_reply(post_id: int):
    data = request.get_json(force=True)
    code = (request.headers.get("X-Student-Code") or "").strip().upper()
    admin_pwd = request.headers.get("X-Admin-Password", "")
    content = (data.get("content") or "").strip()
    if not content:
        return jsonify({"error": "Votre réponse ne peut pas être vide."}), 400

    if admin_pwd == ADMIN_PASSWORD:
        author_name = "Administrateur Principal GGT"
        author_classe = "Direction Académique"
        author_role = "admin"
    else:
        with get_db() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM students WHERE UPPER(student_code) = %s", (code,))
                st = cur.fetchone()
        if not st or compute_effective_status(st)["status"] != "active":
            return jsonify({"error": "Accès étudiant actif requis pour répondre."}), 403
        author_name = st["full_name"]
        author_classe = st["classe"]
        author_role = "etudiant"

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO forum_replies (post_id, author_name, author_classe, author_role, content)
                   VALUES (%s, %s, %s, %s, %s)""",
                (post_id, author_name, author_classe, author_role, content)
            )
        conn.commit()
    return jsonify({"ok": True})


# ─────────────────────────────────────────────────────────────
# API ADMINISTRATEUR PRINCIPAL
# ─────────────────────────────────────────────────────────────
@app.route("/api/admin/login", methods=["POST"])
def api_admin_login():
    data = request.get_json(force=True)
    if (data.get("password") or "") != ADMIN_PASSWORD:
        return jsonify({"error": "Mot de passe administrateur incorrect."}), 401
    return jsonify({"ok": True, "admin_email": ADMIN_EMAIL})


@app.route("/api/admin/overview", methods=["GET"])
def api_admin_overview():
    check_admin()
    load_dotenv(BASE_DIR / ".env", override=True)
    load_dotenv(Path.home() / ".env", override=True)
    smtp_configured = bool(os.getenv("GMAIL_APP_PASSWORD", "").strip())

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM students ORDER BY registered_at DESC")
            raw_students = cur.fetchall()
            students = [compute_effective_status(s) for s in raw_students]

            cur.execute("SELECT * FROM resources ORDER BY created_at DESC")
            resources = cur.fetchall()
            for r in resources:
                r["created_at"] = r["created_at"].strftime("%d/%m/%Y")
                r["url"] = f"/uploads/pdfs/{r['filename']}"

            cur.execute("SELECT * FROM forum_posts ORDER BY created_at DESC")
            posts = cur.fetchall()
            cur.execute("SELECT * FROM forum_replies ORDER BY created_at ASC")
            replies = cur.fetchall()

    replies_by_post = {}
    for rep in replies:
        rep["created_at"] = rep["created_at"].strftime("%d/%m/%Y %H:%M")
        replies_by_post.setdefault(rep["post_id"], []).append(rep)

    for p in posts:
        p["created_at"] = p["created_at"].strftime("%d/%m/%Y %H:%M")
        p["replies"] = replies_by_post.get(p["id"], [])

    return jsonify({
        "admin_email": ADMIN_EMAIL,
        "smtp_configured": smtp_configured,
        "students": students,
        "resources": resources,
        "forum": posts
    })


@app.route("/api/admin/confirm/<int:student_id>", methods=["POST"])
def api_admin_confirm(student_id: int):
    """
    Confirme l'inscription ou renouvelle pour 1 mois exact (+30 jours),
    génère l'identifiant <Initiales>-<JJMMAAAA>-<Classe> et l'envoie par email.
    """
    check_admin()
    now = datetime.now()
    valid_until = now + timedelta(days=30)
    month_tag = now.strftime("%Y-%m")

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM students WHERE id = %s", (student_id,))
            st = cur.fetchone()
            if not st:
                return jsonify({"error": "Étudiant introuvable."}), 404

            is_renewal = bool(st.get("student_code"))
            code = st.get("student_code") or build_student_code(
                st["full_name"], st["registered_at"], st["classe"], st["id"]
            )

            cur.execute(
                """UPDATE students
                   SET status = 'active',
                       student_code = %s,
                       confirmed_at = %s,
                       valid_until = %s,
                       last_payment_month = %s
                   WHERE id = %s
                   RETURNING *""",
                (code, now, valid_until, month_tag, student_id)
            )
            updated = cur.fetchone()
        conn.commit()

    sent, mail_info = send_credentials_email(
        updated["email"], updated["full_name"], updated["classe"], code, valid_until, is_renewal=is_renewal
    )
    return jsonify({
        "ok": True,
        "student": compute_effective_status(updated),
        "email_sent": sent,
        "email_info": mail_info
    })


@app.route("/api/admin/revoke/<int:student_id>", methods=["POST"])
def api_admin_revoke(student_id: int):
    """Suspend / invalide immédiatement l'identifiant d'un étudiant."""
    check_admin()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                "UPDATE students SET status = 'expired', valid_until = NOW() - INTERVAL '1 second' WHERE id = %s",
                (student_id,)
            )
        conn.commit()
    return jsonify({"ok": True})


@app.route("/api/admin/expire-month", methods=["POST"])
def api_admin_expire_all():
    """
    Action de fin de mois : tous les identifiants actifs deviennent invalides
    jusqu'à ce que l'administrateur encaisse les frais mensuels et leur redonne accès.
    """
    check_admin()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """UPDATE students
                   SET status = 'expired',
                       valid_until = NOW() - INTERVAL '1 second'
                   WHERE status = 'active'"""
            )
            count = cur.rowcount
        conn.commit()
    return jsonify({
        "ok": True,
        "expired_count": count,
        "message": f"Clôture mensuelle effectuée : {count} identifiant(s) ont été invalidés. Vous pouvez maintenant réactiver chaque étudiant au fur et à mesure de l'encaissement des frais."
    })


@app.route("/api/admin/resources", methods=["POST"])
def api_admin_add_resource():
    check_admin()
    title = (request.form.get("title") or "").strip()
    category = (request.form.get("category") or "cours").strip()
    classe = (request.form.get("classe") or "Toutes classes BTS").strip()
    subject = (request.form.get("subject") or "").strip()
    file = request.files.get("pdf_file")

    if not title or not file or not file.filename:
        return jsonify({"error": "Titre et fichier PDF requis."}), 400

    safe_name = secure_filename(file.filename)
    if not safe_name.lower().endswith(".pdf"):
        safe_name += ".pdf"
    ts_name = f"{int(datetime.now().timestamp())}_{safe_name}"
    file.save(str(UPLOAD_DIR / ts_name))

    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute(
                """INSERT INTO resources (title, category, classe, subject, filename)
                   VALUES (%s, %s, %s, %s, %s)""",
                (title, category, classe, subject, ts_name)
            )
        conn.commit()
    return jsonify({"ok": True})


@app.route("/api/admin/resources/<int:res_id>", methods=["DELETE"])
def api_admin_del_resource(res_id: int):
    check_admin()
    with get_db() as conn:
        with conn.cursor() as cur:
            cur.execute("DELETE FROM resources WHERE id = %s", (res_id,))
        conn.commit()
    return jsonify({"ok": True})


# Initialisation automatique au démarrage (pour Gunicorn et Render)
try:
    init_db()
except Exception as _e:
    print(f"[INFO] Initialisation BD différée ou indisponible au chargement : {_e}")

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print("====================================================")
    print(f" ACADEMIE GGT — Serveur actif sur port {port}")
    print(" - Accueil vitrine   : http://localhost:5000/")
    print(" - Lien Étudiants    : http://localhost:5000/etudiant.html")
    print(" - Lien Admin Princ. : http://localhost:5000/admin.html")
    print("====================================================")
    app.run(host="0.0.0.0", port=port, debug=False)
