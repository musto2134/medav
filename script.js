/* =========================================================
   MEDAV ROLEPLAY
   WEBSITE SCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTLER
    ===================================================== */

    const applicationModal =
        document.getElementById("applicationModal");

    const openApplicationButton =
        document.getElementById("openApplicationButton");

    const closeApplicationButton =
        document.getElementById("closeApplicationButton");

    const modalOverlay =
        document.querySelector(".modal-overlay");

    const applicationForm =
        document.getElementById("applicationForm");

    const nextStepButton =
        document.getElementById("nextStepButton");

    const previousStepButton =
        document.getElementById("previousStepButton");

    const submitApplicationButton =
        document.getElementById("submitApplicationButton");

    const applicationProgress =
        document.getElementById("applicationProgress");

    const formSteps =
        document.querySelectorAll(".form-step");


    /* =====================================================
       BAŞVURU ADIMLARI
    ===================================================== */

    let currentStep = 1;

    const totalSteps = formSteps.length;


    /* =====================================================
       MODAL AÇ
    ===================================================== */

    function openApplication() {

        if (!applicationModal) {
            return;
        }

        applicationModal.classList.add("active");

        document.body.classList.add("modal-open");

        currentStep = 1;

        updateStep();

    }


    /* =====================================================
       MODAL KAPAT
    ===================================================== */

    function closeApplication() {

        if (!applicationModal) {
            return;
        }

        applicationModal.classList.remove("active");

        document.body.classList.remove("modal-open");

    }


    if (openApplicationButton) {

        openApplicationButton.addEventListener(
            "click",
            openApplication
        );

    }


    if (closeApplicationButton) {

        closeApplicationButton.addEventListener(
            "click",
            closeApplication
        );

    }


    if (modalOverlay) {

        modalOverlay.addEventListener(
            "click",
            closeApplication
        );

    }


    /* =====================================================
       ESC İLE KAPAT
    ===================================================== */

    document.addEventListener("keydown", (event) => {

        if (
            event.key === "Escape" &&
            applicationModal &&
            applicationModal.classList.contains("active")
        ) {

            closeApplication();

        }

    });


    /* =====================================================
       INPUT DEĞERİ
    ===================================================== */

    function getValue(id) {

        const element =
            document.getElementById(id);

        if (!element) {
            return "";
        }

        return String(element.value || "").trim();

    }


    /* =====================================================
       RADIO DEĞERİ
    ===================================================== */

    function getRadioValue(name) {

        const checked =
            document.querySelector(
                `input[name="${name}"]:checked`
            );

        return checked
            ? checked.value.trim()
            : "";

    }


    /* =====================================================
       ADIM KONTROLÜ
    ===================================================== */

    function validateStep(step) {

        let valid = true;

        let firstInvalid = null;


        /* ================================================
           STEP 1
        ================================================ */

        if (step === 1) {

            const name =
                getValue("appName");

            const age =
                getValue("appAge");

            const fivem =
                getValue("appFiveMTime");

            const discord =
                getValue("appDiscord");


            if (!name) {

                showFormError(
                    "Lütfen adınızı ve soyadınızı gir."
                );

                firstInvalid =
                    document.getElementById("appName");

                valid = false;

            }


            if (valid && !age) {

                showFormError(
                    "Lütfen yaşınızı gir."
                );

                firstInvalid =
                    document.getElementById("appAge");

                valid = false;

            }


            if (valid) {

                const numericAge =
                    Number(age);

                if (
                    !Number.isFinite(numericAge) ||
                    numericAge < 13 ||
                    numericAge > 99
                ) {

                    showFormError(
                        "Yaş 13 ile 99 arasında olmalıdır."
                    );

                    firstInvalid =
                        document.getElementById("appAge");

                    valid = false;

                }

            }


            if (valid && !fivem) {

                showFormError(
                    "Lütfen FiveM deneyiminizi yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appFiveMTime"
                    );

                valid = false;

            }


            if (valid && !discord) {

                showFormError(
                    "Lütfen Discord Kullanıcı ID'nizi gir."
                );

                firstInvalid =
                    document.getElementById(
                        "appDiscord"
                    );

                valid = false;

            }


            if (valid) {

                if (!/^\d{17,20}$/.test(discord)) {

                    showFormError(
                        "Geçerli bir Discord Kullanıcı ID'si gir. Örnek: 123456789012345678"
                    );

                    firstInvalid =
                        document.getElementById(
                            "appDiscord"
                        );

                    valid = false;

                }

            }

        }


        /* ================================================
           STEP 2
        ================================================ */

        if (step === 2) {

            const activity =
                getValue("appActivity");

            const previousStaff =
                getRadioValue("experience");

            const previousServers =
                getValue("appServers");


            if (!activity) {

                showFormError(
                    "Lütfen günlük aktiflik süreni yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appActivity"
                    );

                valid = false;

            }


            if (valid && !previousStaff) {

                showFormError(
                    "Daha önce yetkili olup olmadığını seç."
                );

                valid = false;

            }


            if (
                valid &&
                previousStaff === "Evet" &&
                !previousServers
            ) {

                showFormError(
                    "Daha önce yetkili olduysan önceki sunucularını veya deneyimini belirt."
                );

                firstInvalid =
                    document.getElementById(
                        "appServers"
                    );

                valid = false;

            }

        }


        /* ================================================
           STEP 3
        ================================================ */

        if (step === 3) {

            const whyJoin =
                getValue("appWhyJoin");

            const whyYou =
                getValue("appWhyYou");

            const rpKnowledge =
                getValue("appRpKnowledge");


            if (!whyJoin) {

                showFormError(
                    "Lütfen neden MedaV'a katılmak istediğini yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appWhyJoin"
                    );

                valid = false;

            }


            if (valid && !whyYou) {

                showFormError(
                    "Lütfen neden seni seçmemiz gerektiğini yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appWhyYou"
                    );

                valid = false;

            }


            if (valid && !rpKnowledge) {

                showFormError(
                    "Lütfen Roleplay bilgin hakkında bilgi ver."
                );

                firstInvalid =
                    document.getElementById(
                        "appRpKnowledge"
                    );

                valid = false;

            }

        }


        /* ================================================
           STEP 4
        ================================================ */

        if (step === 4) {

            const argument =
                getValue("appArgument");

            const neutrality =
                getValue("appNeutrality");

            const teamConflict =
                getValue("appTeamConflict");


            if (!argument) {

                showFormError(
                    "Lütfen tartışma durumunda ne yapacağını yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appArgument"
                    );

                valid = false;

            }


            if (valid && !neutrality) {

                showFormError(
                    "Lütfen tarafsızlığını nasıl koruyacağını yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appNeutrality"
                    );

                valid = false;

            }


            if (valid && !teamConflict) {

                showFormError(
                    "Lütfen ekip içindeki anlaşmazlıkları nasıl çözeceğini yaz."
                );

                firstInvalid =
                    document.getElementById(
                        "appTeamConflict"
                    );

                valid = false;

            }

        }


        if (firstInvalid) {

            firstInvalid.focus();

        }


        return valid;

    }


    /* =====================================================
       HATA MESAJI
    ===================================================== */

    function showFormError(message) {

        let oldError =
            document.getElementById(
                "applicationFormError"
            );


        if (!oldError) {

            oldError =
                document.createElement("div");

            oldError.id =
                "applicationFormError";

            oldError.style.marginTop =
                "15px";

            oldError.style.padding =
                "12px 15px";

            oldError.style.borderRadius =
                "10px";

            oldError.style.background =
                "rgba(239,68,68,.12)";

            oldError.style.border =
                "1px solid rgba(239,68,68,.35)";

            oldError.style.color =
                "#ff8b8b";

            oldError.style.fontSize =
                "14px";

            const formButtons =
                document.querySelector(
                    ".form-buttons"
                );

            if (formButtons) {

                formButtons.before(oldError);

            }

        }


        oldError.textContent =
            "⚠️ " + message;


        clearTimeout(
            window.medavErrorTimeout
        );


        window.medavErrorTimeout =
            setTimeout(() => {

                oldError.remove();

            }, 5000);

    }


    /* =====================================================
       HATA TEMİZLE
    ===================================================== */

    function clearFormError() {

        const error =
            document.getElementById(
                "applicationFormError"
            );

        if (error) {
            error.remove();
        }

    }


    /* =====================================================
       ADIM GÖSTER
    ===================================================== */

    function updateStep() {

        formSteps.forEach((step) => {

            const stepNumber =
                Number(
                    step.dataset.step
                );

            step.classList.toggle(
                "active",
                stepNumber === currentStep
            );

        });


        /* ================================================
           PROGRESS
        ================================================ */

        if (applicationProgress) {

            const percentage =
                (
                    currentStep /
                    totalSteps
                ) * 100;

            applicationProgress.style.width =
                `${percentage}%`;

        }


        /* ================================================
           GERİ
        ================================================ */

        if (previousStepButton) {

            previousStepButton.style.display =
                currentStep === 1
                    ? "none"
                    : "inline-flex";

        }


        /* ================================================
           İLERİ / GÖNDER
        ================================================ */

        if (nextStepButton) {

            nextStepButton.style.display =
                currentStep === totalSteps
                    ? "none"
                    : "inline-flex";

        }


        if (submitApplicationButton) {

            submitApplicationButton.style.display =
                currentStep === totalSteps
                    ? "inline-flex"
                    : "none";

        }

    }


    /* =====================================================
       İLERİ
    ===================================================== */

    if (nextStepButton) {

        nextStepButton.addEventListener(
            "click",
            () => {

                clearFormError();


                if (!validateStep(currentStep)) {
                    return;
                }


                if (
                    currentStep <
                    totalSteps
                ) {

                    currentStep++;

                    updateStep();

                }

            }
        );

    }


    /* =====================================================
       GERİ
    ===================================================== */

    if (previousStepButton) {

        previousStepButton.addEventListener(
            "click",
            () => {

                clearFormError();


                if (currentStep > 1) {

                    currentStep--;

                    updateStep();

                }

            }
        );

    }


    /* =====================================================
       BAŞVURU VERİLERİ
    ===================================================== */

    function collectApplicationData() {

        const discord =
            getValue("appDiscord");

        const discordName =
            discord;

        const discordActivity =
            getValue("appActivity");

        const age =
            getValue("appAge");

        const activity =
            getValue("appActivity");

        const fivemExperience =
            getValue("appFiveMTime");

        const previousStaff =
            getRadioValue("experience");

        const previousStaffExperience =
            getValue("appServers");

        const characterName =
            getValue("appName");

        const rpExperience =
            getValue("appRpKnowledge");

        const whyStaff =
            getValue("appWhyJoin");

        const strongSides =
            getValue("appWhyYou");

        const argument =
            getValue("appArgument");

        const neutrality =
            getValue("appNeutrality");

        const teamConflict =
            getValue("appTeamConflict");

        const extraNote =
            getValue("appExtra");


        /*
         * server.js "staffTeam" alanını zorunlu
         * tuttuğu için mevcut formdaki başvuru
         * türünü buraya gönderiyoruz.
         */

        const staffTeam =
            "MedaV Yetkili Ekibi";


        /*
         * server.js "weakSides" alanını zorunlu
         * tuttuğu için yönetim sorularını tek
         * alanda birleştiriyoruz.
         */

        const weakSides =
            [
                "Tartışma Durumunda:",
                argument,

                "",

                "Tarafsızlığımı Koruma:",
                neutrality,

                "",

                "Ekip İçi Anlaşmazlık:",
                teamConflict
            ].join("\n");


        return {

            discord,
            discordName,
            discordActivity,

            age,
            activity,
            fivemExperience,

            previousStaff,
            previousStaffExperience,

            characterName,
            rpExperience,

            staffTeam,
            whyStaff,

            strongSides,
            weakSides,

            extraNote

        };

    }


    /* =====================================================
       FORM GÖNDER
    ===================================================== */

    if (applicationForm) {

        applicationForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();

                clearFormError();


                /*
                 * Son adımdan gönderildiğinden emin ol.
                 */

                if (
                    !validateStep(currentStep)
                ) {

                    return;

                }


                /*
                 * Bütün adımları tekrar kontrol et.
                 */

                for (
                    let step = 1;
                    step <= totalSteps;
                    step++
                ) {

                    if (!validateStep(step)) {

                        currentStep =
                            step;

                        updateStep();

                        return;

                    }

                }


                const data =
                    collectApplicationData();


                /*
                 * Butonu kilitle.
                 */

                if (submitApplicationButton) {

                    submitApplicationButton.disabled =
                        true;

                    submitApplicationButton.textContent =
                        "Gönderiliyor...";

                }


                try {

                    const response =
                        await fetch(
                            "/api/yetkili-basvuru",
                            {

                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(data)

                            }
                        );


                    let result = null;


                    try {

                        result =
                            await response.json();

                    } catch {

                        result = null;

                    }


                    if (
                        !response.ok ||
                        !result ||
                        !result.success
                    ) {

                        throw new Error(
                            result?.message ||
                            "Başvuru gönderilemedi."
                        );

                    }


                    /*
                     * BAŞARILI
                     */

                    showSuccessMessage(
                        result.message ||
                        "Başvurun başarıyla gönderildi."
                    );


                    applicationForm.reset();


                    currentStep = 1;

                    updateStep();


                    /*
                     * Birkaç saniye sonra modalı kapat.
                     */

                    setTimeout(() => {

                        closeApplication();

                    }, 3500);


                } catch (error) {

                    console.error(
                        "MedaV başvuru hatası:",
                        error
                    );


                    showFormError(
                        error.message ||
                        "Başvuru gönderilirken bir hata oluştu."
                    );


                } finally {

                    if (submitApplicationButton) {

                        submitApplicationButton.disabled =
                            false;

                        submitApplicationButton.textContent =
                            "Başvuruyu Gönder";

                    }

                }

            }
        );

    }


    /* =====================================================
       BAŞARILI MESAJ
    ===================================================== */

    function showSuccessMessage(message) {

        let successBox =
            document.getElementById(
                "applicationSuccess"
            );


        if (!successBox) {

            successBox =
                document.createElement("div");

            successBox.id =
                "applicationSuccess";

            successBox.style.position =
                "fixed";

            successBox.style.left =
                "50%";

            successBox.style.top =
                "50%";

            successBox.style.transform =
                "translate(-50%, -50%)";

            successBox.style.zIndex =
                "999999";

            successBox.style.width =
                "min(90%, 500px)";

            successBox.style.padding =
                "30px";

            successBox.style.borderRadius =
                "18px";

            successBox.style.textAlign =
                "center";

            successBox.style.background =
                "#11111b";

            successBox.style.border =
                "1px solid rgba(139,92,246,.5)";

            successBox.style.boxShadow =
                "0 25px 80px rgba(0,0,0,.6)";

            successBox.style.color =
                "#fff";

            document.body.appendChild(
                successBox
            );

        }


        successBox.innerHTML = `

            <div style="
                font-size:42px;
                margin-bottom:15px;
            ">
                ✓
            </div>

            <h2 style="
                margin:0 0 10px;
            ">
                Başvuru Gönderildi
            </h2>

            <p style="
                margin:0;
                opacity:.75;
                line-height:1.6;
            ">
                ${escapeHtml(message)}
            </p>

        `;


        setTimeout(() => {

            if (successBox) {
                successBox.remove();
            }

        }, 3500);

    }


    /* =====================================================
       HTML GÜVENLİ METİN
    ===================================================== */

    function escapeHtml(text) {

        const div =
            document.createElement("div");

        div.textContent =
            String(text);

        return div.innerHTML;

    }


    /* =====================================================
       MÜZİK SİSTEMİ
    ===================================================== */

    const musicPlayButton =
        document.getElementById(
            "musicPlayButton"
        );

    const musicMuteButton =
        document.getElementById(
            "musicMuteButton"
        );

    const musicVolume =
        document.getElementById(
            "musicVolume"
        );


    /*
     * Dosya yolu:
     *
     * assets/music/medav.mp3
     *
     * Eğer senin çalışan dosyan farklı klasördeyse
     * sadece aşağıdaki yolu değiştir.
     */

    const music =
        new Audio(
            "assets/music/medav.mp3"
        );


    music.loop = true;

    music.volume = 0.5;


    let musicPlaying = false;

    let musicMuted = false;


    /* =====================================================
       MÜZİK OYNAT
    ===================================================== */

    if (musicPlayButton) {

        musicPlayButton.addEventListener(
            "click",
            async () => {

                try {

                    if (!musicPlaying) {

                        await music.play();

                        musicPlaying =
                            true;

                        musicPlayButton.textContent =
                            "❚❚";

                    } else {

                        music.pause();

                        musicPlaying =
                            false;

                        musicPlayButton.textContent =
                            "▶";

                    }

                } catch (error) {

                    console.error(
                        "Müzik oynatılamadı:",
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       MÜZİK SES
    ===================================================== */

    if (musicVolume) {

        musicVolume.addEventListener(
            "input",
            () => {

                const volume =
                    Number(
                        musicVolume.value
                    );

                music.volume =
                    volume;

                if (volume > 0) {

                    musicMuted =
                        false;

                }

                updateMuteIcon();

            }
        );

    }


    /* =====================================================
       MÜZİK MUTE
    ===================================================== */

    if (musicMuteButton) {

        musicMuteButton.addEventListener(
            "click",
            () => {

                musicMuted =
                    !musicMuted;

                music.muted =
                    musicMuted;

                updateMuteIcon();

            }
        );

    }


    function updateMuteIcon() {

        if (!musicMuteButton) {
            return;
        }


        if (
            musicMuted ||
            music.volume === 0
        ) {

            musicMuteButton.textContent =
                "🔇";

        } else {

            musicMuteButton.textContent =
                "🔊";

        }

    }


    /* =====================================================
       NAVBAR
    ===================================================== */

    const navLinks =
        document.querySelectorAll(
            ".nav-link"
        );


    navLinks.forEach((link) => {

        link.addEventListener(
            "click",
            () => {

                navLinks.forEach(
                    (item) => {

                        item.classList.remove(
                            "active"
                        );

                    }
                );


                link.classList.add(
                    "active"
                );

            }
        );

    });


    /* =====================================================
       BAŞLANGIÇ
    ===================================================== */

    updateStep();


    console.log(
        "🟣 MedaV script.js başarıyla yüklendi."
    );

});