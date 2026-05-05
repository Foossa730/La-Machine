const crypto = require("node:crypto");

const ANSWER_KEY = {
  "real-name": "Julien",
  "origin-city": "Marseille",
  "label-name": "D'or et de platine",
  "first-album": "Dans ma paranoïa",
  nickname: "L'Ovni",
  "tchikita-album": "L'ovni",
  "my-world-year": "2015",
  "hand-sign": "Le signe Jul avec les mains",
  "album-2020": "La Machine",
  "best-song": "Amnésia",
  "release-rhythm": "Il publie très fréquemment de nouveaux projets",
  "sales-status": "L'un des plus gros vendeurs du rap français",
};

const PASS_MARK = 9;
const MAX_ATTEMPTS = 5;

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function getTokenMap() {
  const raw = process.env.ACCESS_TOKENS_JSON;

  if (!raw) {
    throw new Error("ACCESS_TOKENS_JSON manquant dans les variables Netlify.");
  }

  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return Object.fromEntries(parsed.map((entry) => [entry.token, entry]));
  }

  return parsed;
}

function gradeAnswers(answers) {
  if (!Array.isArray(answers)) return 0;

  return answers.reduce((total, answer) => {
    const expected = ANSWER_KEY[answer.questionId];
    return total + (expected && answer.selected === expected ? 1 : 0);
  }, 0);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function getEmailConfig() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const replyTo = process.env.RESEND_REPLY_TO;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY manquant dans les variables Netlify.");
  }

  return { apiKey, from, replyTo };
}

async function sendPlaceEmail({ email, code, correct, tokenHash }) {
  const { Resend } = await import("resend");
  const { apiKey, from, replyTo } = getEmailConfig();
  const resend = new Resend(apiKey);
  const safeCode = escapeHtml(code);

  const { data, error } = await resend.emails.send({
    from,
    to: [email],
    subject: "La Machine t'attend - ta place est validée",
    html: `
      <div style="margin:0;padding:0;background:#080808;color:#f8f5ec;font-family:Arial,sans-serif">
        <div style="max-width:620px;margin:0 auto;padding:32px 22px">
          <p style="margin:0 0 12px;color:#F48023;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase">
            Jul Access Quiz
          </p>
          <h1 style="margin:0 0 18px;color:#F04A25;font-size:34px;line-height:1.05">
            Tu as mérité ta place à la machine.
          </h1>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#f8f5ec">
            Bravo, tu as validé le quiz avec <strong>${correct}/12</strong> bonnes réponses.
          </p>
          <p style="margin:0 0 18px;font-size:16px;line-height:1.6;color:#d8d2c4">
            Télécharge l'application Stade de France et connecte-toi avec le code suivant :
          </p>
          <div style="margin:24px 0;padding:22px;border:1px solid #F04A25;background:#160906">
            <p style="margin:0 0 8px;color:#F48023;font-size:12px;font-weight:800;letter-spacing:1px;text-transform:uppercase">
              Code personnel
            </p>
            <p style="margin:0;color:#F48023;font-size:34px;font-weight:900;letter-spacing:1px">
              ${safeCode}
            </p>
          </div>
          <p style="margin:0;font-size:14px;line-height:1.6;color:#b6ae9d">
            Ce code est personnel et à usage unique. Ne le partage pas.
          </p>
        </div>
      </div>
    `,
    text: [
      "Jul Access Quiz",
      "Tu as mérité ta place à la machine.",
      `Bravo, tu as validé le quiz avec ${correct}/12.`,
      "Télécharge l'application Stade de France et connecte-toi avec le code suivant :",
      code,
      "Ce code est personnel et à usage unique. Ne le partage pas.",
    ].join("\n\n"),
    ...(replyTo ? { replyTo } : {}),
    headers: {
      "Idempotency-Key": `jul-access-${tokenHash}`,
    },
    tags: [
      {
        name: "quiz",
        value: "jul_access",
      },
    ],
  });

  if (error) {
    throw new Error(error.message || "Erreur lors de l'envoi de l'email.");
  }

  return data;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Méthode non autorisée." });
  }

  let payload;

  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { message: "Requête invalide." });
  }

  const token = String(payload.token || "").trim();

  if (!token) {
    return json(401, { message: "Lien personnel manquant. Utilise le lien complet avec ton token." });
  }

  let tokenMap;

  try {
    tokenMap = getTokenMap();
  } catch (error) {
    return json(500, { message: error.message });
  }

  const tokenData = tokenMap[token];

  if (!tokenData || !tokenData.code || !tokenData.email) {
    return json(403, { message: "Lien invalide ou non reconnu." });
  }

  if (tokenData.expiresAt && Date.now() > Date.parse(tokenData.expiresAt)) {
    return json(403, { message: "Ce lien a expiré." });
  }

  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: "jul-access-quiz", consistency: "strong" });
  const tokenHash = hashToken(token);
  const claimedKey = `claimed/${tokenHash}`;
  const attemptsKey = `attempts/${tokenHash}`;

  const claimed = await store.get(claimedKey, { type: "json" });

  if (claimed) {
    return json(409, { message: "Ce lien a déjà été utilisé." });
  }

  const attempts = (await store.get(attemptsKey, { type: "json" })) || {
    count: 0,
  };

  if (attempts.count >= MAX_ATTEMPTS) {
    return json(429, { message: "Trop de tentatives sur ce lien." });
  }

  const correct = gradeAnswers(payload.answers);

  await store.setJSON(
    attemptsKey,
    {
      count: attempts.count + 1,
      lastAttemptAt: new Date().toISOString(),
      lastScore: correct,
    },
    { metadata: { tokenHash } },
  );

  if (correct < PASS_MARK) {
    return json(403, {
      message: `Score insuffisant: ${correct}/12. Il faut au moins ${PASS_MARK} bonnes réponses.`,
      correct,
      unlocked: false,
    });
  }

  const reservationKey = `reserved/${tokenHash}`;
  const reservation = await store.setJSON(
    reservationKey,
    {
      reservedAt: new Date().toISOString(),
      score: correct,
    },
    {
      metadata: { tokenHash },
      onlyIfNew: true,
    },
  );

  if (!reservation.modified) {
    return json(409, { message: "Ce lien est déjà en cours de traitement ou utilisé." });
  }

  let emailResult;

  try {
    emailResult = await sendPlaceEmail({
      email: tokenData.email,
      code: tokenData.code,
      correct,
      tokenHash,
    });
  } catch (error) {
    await store.setJSON(
      `email-errors/${tokenHash}-${Date.now()}`,
      {
        failedAt: new Date().toISOString(),
        message: error.message,
      },
      { metadata: { tokenHash } },
    );

    return json(502, {
      message: "La place est validée, mais l'email n'a pas pu être envoyé. Contacte l'organisateur.",
    });
  }

  const { modified } = await store.setJSON(
    claimedKey,
    {
      claimedAt: new Date().toISOString(),
      score: correct,
      email: tokenData.email,
      resendEmailId: emailResult?.id || null,
    },
    {
      metadata: { tokenHash },
      onlyIfNew: true,
    },
  );

  if (!modified) {
    return json(409, { message: "Ce lien a déjà été utilisé." });
  }

  return json(200, {
    unlocked: true,
    correct,
    delivery: "email",
    email: tokenData.email.replace(/^(.{2}).*(@.*)$/, "$1***$2"),
  });
};
