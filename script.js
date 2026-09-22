let currentStep = 0;

const steps = document.querySelectorAll(".step");
const modal = document.getElementById("applicationModal");
const progressBar = document.getElementById("progressBar");
const stepText = document.getElementById("stepText");
const backButton = document.getElementById("backButton");
const nextButton = document.getElementById("nextButton");
const form = document.getElementById("applicationForm");
const summary = document.getElementById("applicationSummary");

function openApplication() {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    currentStep = 0;
    showStep();
}

function closeApplication() {
    modal.classList.remove("active");
    document.body.style.overflow = "";
}

function showStep() {
    steps.forEach((step, index) => {
        step.classList.toggle("active", index === currentStep);
    });

    const totalSteps = steps.length;

    stepText.textContent = `Adım ${currentStep + 1} / ${totalSteps}`;

    const progress = ((currentStep + 1) / totalSteps) * 100;
    progressBar.style.width = `${progress}%`;

    if (currentStep === 0) {
        backButton.style.visibility = "hidden";
    } else {
        backButton.style.visibility = "visible";
    }

    if (currentStep === totalSteps - 1) {
        nextButton.textContent = "Başvuruyu Gönder";
        updateSummary();
    } else {
        nextButton.textContent = "İleri →";
    }
}

function validateCurrentStep() {
    const current = steps[currentStep];

    const fields = current.querySelectorAll(
        "input[required], textarea[required], select[required]"
    );

    for (const field of fields) {
        if (!field.value.trim()) {
            field.focus();
            alert("Lütfen tüm zorunlu alanları doldurun.");
            return false;
        }
    }

    return true;
}

function nextStep() {
    if (!validateCurrentStep()) {
        return;
    }

    if (currentStep < steps.length - 1) {
        currentStep++;
        showStep();
    } else {
        submitApplication();
    }
}

function previousStep() {
    if (currentStep > 0) {
        currentStep--;
        showStep();
    }
}

function updateSummary() {
    const data = new FormData(form);

    const fields = [
        ["Ad Soyad", data.get("isim")],
        ["Yaş", data.get("yas")],
        ["Discord", data.get("discord")],
        ["FiveM Süresi", data.get("fivem")],
        ["Aktiflik", data.get("aktiflik")],
        ["Yetkili Deneyimi", data.get("deneyim")],
        ["Sunucular", data.get("sunucular")],
        ["Neden MedaV", data.get("neden")],
        ["Neden Tercih", data.get("tercih")],
        ["RP Bilgisi", data.get("rp")],
        ["Tartışma Yaklaşımı", data.get("tartisma")],
        ["Tarafsızlık", data.get("tarafsizlik")],
        ["Ekip Anlaşmazlığı", data.get("anlasmazlik")],
        ["Ek Bilgi", data.get("ek") || "Belirtilmedi"]
    ];

    summary.innerHTML = fields
        .map(([title, value]) => `
            <div class="summary-item">
                <strong>${escapeHTML(title)}</strong>
                <span>${escapeHTML(value || "-")}</span>
            </div>
        `)
        .join("");
}

function submitApplication() {
    if (!validateCurrentStep()) {
        return;
    }

    const data = new FormData(form);

    console.log("MEDAV YETKİLİ BAŞVURUSU");
    console.log("────────────────────────");

    for (const [key, value] of data.entries()) {
        console.log(`${key}: ${value}`);
    }

    alert(
        "Başvurun hazırlandı!\n\n" +
        "Şu an form bilgileri tarayıcı konsoluna aktarılıyor.\n\n" +
        "Discord'a otomatik gönderim için sonraki aşamada bağlantıyı kuracağız."
    );

    closeApplication();

    form.reset();

    currentStep = 0;
    showStep();
}

function escapeHTML(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

modal.addEventListener("click", function (event) {
    if (event.target === modal) {
        closeApplication();
    }
});

document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && modal.classList.contains("active")) {
        closeApplication();
    }
});

showStep();