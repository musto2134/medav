const express = require("express");

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle
} = require("discord.js");

require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 3000;

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN?.trim();

const APPLICATION_CHANNEL_ID = "1551815098170081401";
const STAFF_ROLE_ID = "1551830696111243295";


/* =====================================================
   EXPRESS
===================================================== */

app.use(express.json({
    limit: "1mb"
}));

app.use(express.static(__dirname));

app.get("/health", (req, res) => {
    res.status(200).send("MedaV OK");
});


/* =====================================================
   DISCORD CLIENT
===================================================== */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});


let discordReady = false;
let loginStartedAt = null;
let connectionTimer = null;


/* =====================================================
   DISCORD DEBUG
===================================================== */

client.on("debug", (info) => {

    const text = String(info);
    const lower = text.toLowerCase();

    if (
        lower.includes("provided token") ||
        lower.includes("token")
    ) {
        console.log("[DISCORD DEBUG] Token bilgisi gizlendi.");
        return;
    }

    console.log("[DISCORD DEBUG]", text);
});


/* =====================================================
   DISCORD WARN
===================================================== */

client.on("warn", (info) => {

    console.warn("[DISCORD WARN]", info);

});


/* =====================================================
   SHARD DISCONNECT
===================================================== */

client.on("shardDisconnect", (event, shardId) => {

    discordReady = false;

    console.error("[DISCORD] Baglanti kesildi.");
    console.error("[DISCORD] Shard:", shardId);
    console.error("[DISCORD] Kod:", event?.code || "Bilinmiyor");

});


/* =====================================================
   SHARD RECONNECTING
===================================================== */

client.on("shardReconnecting", (shardId) => {

    discordReady = false;

    console.log("[DISCORD] Yeniden baglaniyor...");
    console.log("[DISCORD] Shard:", shardId);

});


/* =====================================================
   SHARD READY
===================================================== */

client.on("shardReady", (shardId) => {

    discordReady = true;

    console.log("[DISCORD] Shard hazir:", shardId);

});


/* =====================================================
   INVALIDATED
===================================================== */

client.on("invalidated", () => {

    discordReady = false;

    console.error("[DISCORD] Baglanti gecersiz hale geldi.");

});


/* =====================================================
   CLIENT READY
===================================================== */

client.once("clientReady", () => {

    discordReady = true;

    if (connectionTimer) {
        clearInterval(connectionTimer);
        connectionTimer = null;
    }

    console.log("");
    console.log("=================================");
    console.log("       MEDAV ROLEPLAY");
    console.log("   Yetkili Basvuru Sistemi");
    console.log("=================================");

    console.log("[DISCORD] Bot:", client.user.tag);
    console.log("[DISCORD] Bot ID:", client.user.id);
    console.log("[DISCORD] Bot basariyla baglandi.");
    console.log("[DISCORD] Gateway tamamen hazir.");

});


/* =====================================================
   DISCORD CLIENT ERROR
===================================================== */

client.on("error", (error) => {

    console.error("[DISCORD ERROR]");
    console.error("Kod:", error?.code || "Bilinmiyor");
    console.error("Ad:", error?.name || "Bilinmiyor");
    console.error("Mesaj:", error?.message || "Bilinmiyor");

});


/* =====================================================
   DISCORD SHARD ERROR
===================================================== */

client.on("shardError", (error, shardId) => {

    console.error("[DISCORD SHARD ERROR]");
    console.error("Shard:", shardId);
    console.error("Kod:", error?.code || "Bilinmiyor");
    console.error("Mesaj:", error?.message || "Bilinmiyor");

});


/* =====================================================
   GUVENLI METIN
===================================================== */

function safeText(value) {

    if (
        value === undefined ||
        value === null ||
        String(value).trim() === ""
    ) {
        return "Belirtilmedi.";
    }

    return String(value)
        .replace(/@everyone/gi, "@\u200Beveryone")
        .replace(/@here/gi, "@\u200Bhere")
        .substring(0, 1000);

}


/* =====================================================
   YETKILI BASVURUSU
===================================================== */

app.post(
    "/api/yetkili-basvuru",
    async (req, res) => {

        try {

            if (!client.isReady()) {

                return res.status(503).json({
                    success: false,
                    message: "Discord botu henuz hazir degil."
                });

            }

            const {
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
            } = req.body;


            const discordId =
                String(discord || "").trim();


            if (!/^\d{17,20}$/.test(discordId)) {

                return res.status(400).json({
                    success: false,
                    message: "Gecerli bir Discord Kullanici ID'si gir."
                });

            }


            const requiredFields = [

                ["discordActivity", discordActivity],
                ["age", age],
                ["activity", activity],
                ["fivemExperience", fivemExperience],
                ["previousStaff", previousStaff],
                ["characterName", characterName],
                ["rpExperience", rpExperience],
                ["staffTeam", staffTeam],
                ["whyStaff", whyStaff],
                ["strongSides", strongSides],
                ["weakSides", weakSides]

            ];


            for (
                const [fieldName, fieldValue]
                of requiredFields
            ) {

                if (
                    fieldValue === undefined ||
                    fieldValue === null ||
                    String(fieldValue).trim() === ""
                ) {

                    return res.status(400).json({
                        success: false,
                        message:
                            `${fieldName} alani bos birakilamaz.`
                    });

                }

            }


            if (
                previousStaff === "Evet" &&
                !previousStaffExperience
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        "Daha once yetkili olduysan deneyimini belirtmelisin."
                });

            }


            const channel =
                await client.channels.fetch(
                    APPLICATION_CHANNEL_ID
                );


            if (!channel) {

                return res.status(500).json({
                    success: false,
                    message: "Basvuru kanali bulunamadi."
                });

            }


            let discordUser = null;

            try {

                discordUser =
                    await client.users.fetch(
                        discordId
                    );

            } catch {

                discordUser = null;

            }


            const mention =
                `<@${discordId}>`;


            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "Yeni MedaV Yetkili Basvurusu"
                    )

                    .setDescription(
                        `${mention} tarafindan web sitesi uzerinden yeni bir yetkili basvurusu gonderildi.`
                    )

                    .setColor(0x8b5cf6)

                    .addFields(

                        {
                            name: "Discord Bilgileri",
                            value:
                                `Kullanici: ${discordUser ? discordUser.tag : safeText(discordName)}\n` +
                                `ID: ${safeText(discordId)}\n` +
                                `Mention: ${mention}`
                        },

                        {
                            name: "Kisisel Bilgiler",
                            value:
                                `Ad Soyad: ${safeText(characterName)}\n` +
                                `Yas: ${safeText(age)}\n` +
                                `Gunluk Aktiflik: ${safeText(activity)}\n` +
                                `FiveM Tecrubesi: ${safeText(fivemExperience)}`
                        },

                        {
                            name: "Yetkili Gecmisi",
                            value:
                                `Daha Once Yetkili: ${safeText(previousStaff)}\n` +
                                `Deneyim: ${safeText(previousStaffExperience)}`
                        },

                        {
                            name: "Roleplay",
                            value: safeText(rpExperience)
                        },

                        {
                            name: "Basvurulan Ekip",
                            value: safeText(staffTeam)
                        },

                        {
                            name: "Neden Yetkili Olmak Istiyor?",
                            value: safeText(whyStaff)
                        },

                        {
                            name: "Guclu Yonleri",
                            value: safeText(strongSides)
                        },

                        {
                            name: "Tartisma / Yonetim",
                            value: safeText(weakSides)
                        },

                        {
                            name: "Ek Not",
                            value: safeText(extraNote)
                        }

                    )

                    .setFooter({
                        text: "MedaV Yetkili Basvuru Sistemi"
                    })

                    .setTimestamp();


            const buttons =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `application_approve_${discordId}`
                            )
                            .setLabel("Onayla")
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Success),

                        new ButtonBuilder()
                            .setCustomId(
                                `application_reject_${discordId}`
                            )
                            .setLabel("Reddet")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Danger)

                    );


            const message =
                await channel.send({

                    content:
                        `Yeni Yetkili Basvurusu - ${mention}`,

                    embeds: [embed],

                    components: [buttons],

                    allowedMentions: {
                        users: [discordId]
                    }

                });


            console.log(
                "[APPLICATION] Yeni basvuru:",
                discordId
            );


            return res.status(200).json({

                success: true,

                message:
                    "Basvurun basariyla gonderildi.",

                applicationMessageId:
                    message.id

            });


        } catch (error) {

            console.error(
                "[APPLICATION ERROR]",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Basvuru gonderilirken sunucu hatasi olustu."

            });

        }

    }
);


/* =====================================================
   DISCORD ETKILESIMLERI
===================================================== */

client.on(
    "interactionCreate",
    async (interaction) => {

        try {

            if (interaction.isButton()) {

                const customId =
                    interaction.customId;


                /* ================================
                   ONAY
                ================================= */

                if (
                    customId.startsWith(
                        "application_approve_"
                    )
                ) {

                    if (
                        !interaction.member.roles.cache.has(
                            STAFF_ROLE_ID
                        )
                    ) {

                        return interaction.reply({
                            content: "Bu islem icin yetkin yok.",
                            ephemeral: true
                        });

                    }


                    const discordId =
                        customId.replace(
                            "application_approve_",
                            ""
                        );


                    try {

                        const guild =
                            interaction.guild;

                        const member =
                            await guild.members.fetch(
                                discordId
                            );

                        await member.roles.add(
                            STAFF_ROLE_ID
                        );

                    } catch (roleError) {

                        console.error(
                            "[ROLE ERROR]",
                            roleError
                        );

                    }


                    try {

                        const user =
                            await client.users.fetch(
                                discordId
                            );

                        await user.send(
                            "MedaV Yetkili Basvurun Onaylandi!\n\n" +
                            "Tebrikler! Yetkili ekibimize kabul edildin. " +
                            "Yonetim ekibi seninle Discord uzerinden iletisime gececektir."
                        );

                    } catch (dmError) {

                        console.error(
                            "[DM ERROR]",
                            dmError
                        );

                    }


                    const oldEmbed =
                        interaction.message.embeds[0];


                    const updatedEmbed =
                        EmbedBuilder.from(oldEmbed)
                            .setTitle(
                                "Yetkili Basvurusu Onaylandi"
                            )
                            .setColor(0x57F287)
                            .addFields({
                                name: "Onaylayan",
                                value:
                                    `<@${interaction.user.id}>`
                            });


                    const disabledButtons =
                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        "approved_disabled"
                                    )
                                    .setLabel("Onaylandi")
                                    .setEmoji("✅")
                                    .setStyle(
                                        ButtonStyle.Success
                                    )
                                    .setDisabled(true),

                                new ButtonBuilder()
                                    .setCustomId(
                                        "rejected_disabled"
                                    )
                                    .setLabel("Reddet")
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )
                                    .setDisabled(true)

                            );


                    await interaction.update({

                        embeds: [
                            updatedEmbed
                        ],

                        components: [
                            disabledButtons
                        ]

                    });


                    return;

                }


                /* ================================
                   REDDET
                ================================= */

                if (
                    customId.startsWith(
                        "application_reject_"
                    )
                ) {

                    if (
                        !interaction.member.roles.cache.has(
                            STAFF_ROLE_ID
                        )
                    ) {

                        return interaction.reply({
                            content: "Bu islem icin yetkin yok.",
                            ephemeral: true
                        });

                    }


                    const discordId =
                        customId.replace(
                            "application_reject_",
                            ""
                        );


                    const modal =
                        new ModalBuilder()
                            .setCustomId(
                                `reject_reason_${discordId}_${interaction.message.id}`
                            )
                            .setTitle(
                                "Basvuruyu Reddet"
                            );


                    const reasonInput =
                        new TextInputBuilder()
                            .setCustomId("reason")
                            .setLabel("Red sebebi")
                            .setPlaceholder(
                                "Basvurunun neden reddedildigini yaz..."
                            )
                            .setStyle(
                                TextInputStyle.Paragraph
                            )
                            .setRequired(true)
                            .setMaxLength(1000);


                    modal.addComponents(

                        new ActionRowBuilder()
                            .addComponents(
                                reasonInput
                            )

                    );


                    return interaction.showModal(
                        modal
                    );

                }

            }


            /* =================================================
               RED MODALI
            ================================================= */

            if (interaction.isModalSubmit()) {

                if (
                    !interaction.customId.startsWith(
                        "reject_reason_"
                    )
                ) {
                    return;
                }


                const parts =
                    interaction.customId.split("_");


                const discordId =
                    parts[2];

                const messageId =
                    parts[3];


                const reason =
                    interaction.fields.getTextInputValue(
                        "reason"
                    );


                try {

                    const user =
                        await client.users.fetch(
                            discordId
                        );


                    await user.send(

                        "MedaV Yetkili Basvurun Reddedildi.\n\n" +
                        `Red sebebi:\n${reason}\n\n` +
                        "Ilerleyen donemlerde tekrar basvuru yapabilirsin."

                    );

                } catch (dmError) {

                    console.error(
                        "[REJECT DM ERROR]",
                        dmError
                    );

                }


                try {

                    const channel =
                        interaction.channel;


                    const message =
                        await channel.messages.fetch(
                            messageId
                        );


                    const oldEmbed =
                        message.embeds[0];


                    const updatedEmbed =
                        EmbedBuilder.from(oldEmbed)

                            .setTitle(
                                "Yetkili Basvurusu Reddedildi"
                            )

                            .setColor(0xED4245)

                            .addFields(

                                {
                                    name: "Reddeden",
                                    value:
                                        `<@${interaction.user.id}>`
                                },

                                {
                                    name: "Red Sebebi",
                                    value:
                                        safeText(reason)
                                }

                            );


                    const disabledButtons =
                        new ActionRowBuilder()
                            .addComponents(

                                new ButtonBuilder()
                                    .setCustomId(
                                        "approved_disabled"
                                    )
                                    .setLabel("Onayla")
                                    .setStyle(
                                        ButtonStyle.Success
                                    )
                                    .setDisabled(true),

                                new ButtonBuilder()
                                    .setCustomId(
                                        "rejected_disabled"
                                    )
                                    .setLabel("Reddedildi")
                                    .setEmoji("❌")
                                    .setStyle(
                                        ButtonStyle.Danger
                                    )
                                    .setDisabled(true)

                            );


                    await message.edit({

                        embeds: [
                            updatedEmbed
                        ],

                        components: [
                            disabledButtons
                        ]

                    });


                } catch (messageError) {

                    console.error(
                        "[MESSAGE UPDATE ERROR]",
                        messageError
                    );

                }


                return interaction.reply({

                    content:
                        "Basvuru reddedildi.",

                    ephemeral: true

                });

            }

        } catch (error) {

            console.error(
                "[INTERACTION ERROR]",
                error
            );


            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                try {

                    await interaction.reply({

                        content:
                            "Islem sirasinda bir hata olustu.",

                        ephemeral: true

                    });

                } catch {}

            }

        }

    }
);


/* =====================================================
   BOT LOGIN
===================================================== */

if (!BOT_TOKEN) {

    console.error(
        "[DISCORD] DISCORD_BOT_TOKEN bulunamadi!"
    );

} else {

    loginStartedAt = Date.now();

    console.log("");
    console.log("=================================");
    console.log("      MEDAV DISCORD TEST");
    console.log("=================================");

    console.log(
        "[DISCORD] Gateway login baslatiliyor..."
    );

    console.log(
        "[DISCORD] Token mevcut: EVET"
    );

    console.log(
        "[DISCORD] Token uzunlugu:",
        BOT_TOKEN.length
    );

    console.log(
        "[DISCORD] Gateway baglantisi baslatiliyor..."
    );


    let checkCount = 0;


    connectionTimer = setInterval(() => {

        checkCount++;

        const elapsed =
            Math.floor(
                (Date.now() - loginStartedAt) / 1000
            );


        console.log("");
        console.log(
            "[DISCORD] Baglanti kontrolu #" +
            checkCount
        );

        console.log(
            "[DISCORD] Gecen sure:",
            elapsed,
            "saniye"
        );

        console.log(
            "[DISCORD] Client hazir:",
            client.isReady()
                ? "EVET"
                : "HAYIR"
        );

        console.log(
            "[DISCORD] WebSocket status:",
            client.ws?.status ?? "Bilinmiyor"
        );


        if (client.isReady()) {

            console.log(
                "[DISCORD] Baglanti hazir."
            );

            clearInterval(connectionTimer);
            connectionTimer = null;

        } else {

            console.log(
                "[DISCORD] Gateway henuz READY olmadi."
            );

        }


        if (
            elapsed >= 60 &&
            !client.isReady()
        ) {

            console.error("");
            console.error(
                "[DISCORD] 60 saniyedir READY gelmedi."
            );

            console.error(
                "[DISCORD] Render -> Discord Gateway baglantisi incelenmeli."
            );

            clearInterval(connectionTimer);
            connectionTimer = null;

        }

    }, 5000);


    client.login(BOT_TOKEN)

        .then(() => {

            console.log(
                "[DISCORD] login() cagrisi tamamlandi."
            );

            console.log(
                "[DISCORD] READY eventi bekleniyor..."
            );

        })

        .catch((error) => {

            discordReady = false;


            if (connectionTimer) {
                clearInterval(connectionTimer);
                connectionTimer = null;
            }


            console.error("");
            console.error(
                "[DISCORD] LOGIN BASARISIZ!"
            );

            console.error(
                "[DISCORD] Hata kodu:",
                error?.code || "Bilinmiyor"
            );

            console.error(
                "[DISCORD] Hata adi:",
                error?.name || "Bilinmiyor"
            );

            console.error(
                "[DISCORD] Hata mesaji:",
                error?.message || "Bilinmiyor"
            );

        });

}


/* =====================================================
   WEB SERVER
===================================================== */

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `MedaV web sunucusu ${PORT} portunda calisiyor.`
        );

    }
);