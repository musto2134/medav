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

const BOT_TOKEN =
    process.env.DISCORD_BOT_TOKEN?.trim();

const APPLICATION_CHANNEL_ID =
    "1551815098170081401";

const STAFF_ROLE_ID =
    "1551830696111243295";


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


/* =====================================================
   READY
===================================================== */

client.once("clientReady", () => {

    console.log("");
    console.log("=================================");
    console.log("       MEDAV ROLEPLAY");
    console.log("   Yetkili Başvuru Sistemi");
    console.log("=================================");

    console.log(
        `🤖 Discord Bot: ${client.user.tag}`
    );

    console.log(
        "🟢 Discord botu başarıyla bağlandı."
    );

    console.log(
        "🟢 Discord Gateway tamamen hazır."
    );

});


/* =====================================================
   HATA
===================================================== */

client.on("error", (error) => {

    console.error(
        "❌ Discord Client Hatası:",
        error
    );

});


client.on("shardError", (error) => {

    console.error(
        "❌ Discord Shard Hatası:",
        error
    );

});


/* =====================================================
   GÜVENLİ METİN
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
   BAŞVURU
===================================================== */

app.post(
    "/api/yetkili-basvuru",
    async (req, res) => {

        try {

            /* =========================================
               BOT
            ========================================= */

            if (!client.isReady()) {

                return res.status(503).json({

                    success: false,

                    message:
                        "Discord botu henüz hazır değil."

                });

            }


            /* =========================================
               VERİLER
            ========================================= */

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


            /* =========================================
               DISCORD ID
            ========================================= */

            const discordId =
                String(discord || "").trim();


            if (
                !/^\d{17,20}$/.test(discordId)
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Geçerli bir Discord Kullanıcı ID'si gir."

                });

            }


            /* =========================================
               ZORUNLU ALANLAR
            ========================================= */

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
                            `${fieldName} alanı boş bırakılamaz.`

                    });

                }

            }


            /* =========================================
               ÖNCEKİ YETKİLİ
            ========================================= */

            if (
                previousStaff === "Evet" &&
                !previousStaffExperience
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Daha önce yetkili olduysan deneyimini belirtmelisin."

                });

            }


            /* =========================================
               KANAL
            ========================================= */

            const channel =
                await client.channels.fetch(
                    APPLICATION_CHANNEL_ID
                );


            if (!channel) {

                return res.status(500).json({

                    success: false,

                    message:
                        "Başvuru kanalı bulunamadı."

                });

            }


            /* =========================================
               DISCORD KULLANICI
            ========================================= */

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


            /* =========================================
               EMBED
            ========================================= */

            const embed =
                new EmbedBuilder()

                    .setTitle(
                        "📋 Yeni MedaV Yetkili Başvurusu"
                    )

                    .setDescription(
                        `${mention} tarafından web sitesi üzerinden yeni bir yetkili başvurusu gönderildi.`
                    )

                    .setColor(0x8b5cf6)

                    .addFields(

                        {
                            name:
                                "👤 Discord Bilgileri",

                            value:
                                `**Kullanıcı:** ${discordUser ? discordUser.tag : safeText(discordName)}\n` +
                                `**ID:** ${safeText(discordId)}\n` +
                                `**Mention:** ${mention}`
                        },

                        {
                            name:
                                "📌 Kişisel Bilgiler",

                            value:
                                `**Ad Soyad:** ${safeText(characterName)}\n` +
                                `**Yaş:** ${safeText(age)}\n` +
                                `**Günlük Aktiflik:** ${safeText(activity)}\n` +
                                `**FiveM Tecrübesi:** ${safeText(fivemExperience)}`
                        },

                        {
                            name:
                                "🛡️ Yetkili Geçmişi",

                            value:
                                `**Daha Önce Yetkili:** ${safeText(previousStaff)}\n` +
                                `**Deneyim:** ${safeText(previousStaffExperience)}`
                        },

                        {
                            name:
                                "🎭 Roleplay",

                            value:
                                safeText(rpExperience)
                        },

                        {
                            name:
                                "🔰 Başvurulan Ekip",

                            value:
                                safeText(staffTeam)
                        },

                        {
                            name:
                                "❓ Neden Yetkili Olmak İstiyor?",

                            value:
                                safeText(whyStaff)
                        },

                        {
                            name:
                                "💪 Güçlü Yönleri",

                            value:
                                safeText(strongSides)
                        },

                        {
                            name:
                                "⚠️ Tartışma / Yönetim",

                            value:
                                safeText(weakSides)
                        },

                        {
                            name:
                                "📝 Ek Not",

                            value:
                                safeText(extraNote)
                        }

                    )

                    .setFooter({

                        text:
                            "MedaV Yetkili Başvuru Sistemi"

                    })

                    .setTimestamp();


            /* =========================================
               BUTONLAR
            ========================================= */

            const buttons =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()

                            .setCustomId(
                                `application_approve_${discordId}`
                            )

                            .setLabel(
                                "Onayla"
                            )

                            .setEmoji("✅")

                            .setStyle(
                                ButtonStyle.Success
                            ),

                        new ButtonBuilder()

                            .setCustomId(
                                `application_reject_${discordId}`
                            )

                            .setLabel(
                                "Reddet"
                            )

                            .setEmoji("❌")

                            .setStyle(
                                ButtonStyle.Danger
                            )

                    );


            /* =========================================
               DISCORD'A GÖNDER
            ========================================= */

            const message =
                await channel.send({

                    content:
                        `📢 **Yeni Yetkili Başvurusu** — ${mention}`,

                    embeds: [
                        embed
                    ],

                    components: [
                        buttons
                    ],

                    allowedMentions: {
                        users: [
                            discordId
                        ]
                    }

                });


            console.log(
                "🟢 Yeni yetkili başvurusu gönderildi:",
                discordId
            );


            return res.status(200).json({

                success: true,

                message:
                    "Başvurun başarıyla gönderildi.",

                applicationMessageId:
                    message.id

            });


        } catch (error) {

            console.error(
                "❌ Yetkili başvuru hatası:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Başvuru gönderilirken sunucu hatası oluştu."

            });

        }

    }
);


/* =====================================================
   DISCORD ETKİLEŞİMLERİ
===================================================== */

client.on(
    "interactionCreate",
    async (interaction) => {

        try {

            /* =================================================
               BUTONLAR
            ================================================= */

            if (interaction.isButton()) {

                const customId =
                    interaction.customId;


                /* =============================================
                   ONAY
                ============================================= */

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

                            content:
                                "❌ Bu işlem için yetkin yok.",

                            ephemeral: true

                        });

                    }


                    const discordId =
                        customId.replace(
                            "application_approve_",
                            ""
                        );


                    /* =========================================
                       ROL VER
                    ========================================= */

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
                            "❌ Rol verme hatası:",
                            roleError
                        );

                    }


                    /* =========================================
                       DM
                    ========================================= */

                    try {

                        const user =
                            await client.users.fetch(
                                discordId
                            );


                        await user.send(
                            "✅ **MedaV Yetkili Başvurun Onaylandı!**\n\nTebrikler! Yetkili ekibimize kabul edildin. Yönetim ekibi seninle Discord üzerinden iletişime geçecektir."
                        );


                    } catch (dmError) {

                        console.error(
                            "DM gönderilemedi:",
                            dmError
                        );

                    }


                    /* =========================================
                       EMBED
                    ========================================= */

                    const oldEmbed =
                        interaction.message.embeds[0];


                    const updatedEmbed =
                        EmbedBuilder.from(
                            oldEmbed
                        )

                        .setTitle(
                            "✅ Yetkili Başvurusu Onaylandı"
                        )

                        .setColor(0x57F287)

                        .addFields({

                            name:
                                "Onaylayan",

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

                                    .setLabel(
                                        "Onaylandı"
                                    )

                                    .setEmoji("✅")

                                    .setStyle(
                                        ButtonStyle.Success
                                    )

                                    .setDisabled(true),

                                new ButtonBuilder()

                                    .setCustomId(
                                        "rejected_disabled"
                                    )

                                    .setLabel(
                                        "Reddet"
                                    )

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


                /* =============================================
                   REDDET
                ============================================= */

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

                            content:
                                "❌ Bu işlem için yetkin yok.",

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
                                "Başvuruyu Reddet"
                            );


                    const reasonInput =
                        new TextInputBuilder()

                            .setCustomId(
                                "reason"
                            )

                            .setLabel(
                                "Red sebebi"
                            )

                            .setPlaceholder(
                                "Başvurunun neden reddedildiğini yaz..."
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


                /* =========================================
                   DM
                ========================================= */

                try {

                    const user =
                        await client.users.fetch(
                            discordId
                        );


                    await user.send(

                        "❌ **MedaV Yetkili Başvurun Reddedildi.**\n\n" +
                        `**Red sebebi:**\n${reason}\n\n` +
                        "İlerleyen dönemlerde tekrar başvuru yapabilirsin."

                    );


                } catch (dmError) {

                    console.error(
                        "Red DM gönderilemedi:",
                        dmError
                    );

                }


                /* =========================================
                   MESAJI BUL
                ========================================= */

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
                        EmbedBuilder.from(
                            oldEmbed
                        )

                        .setTitle(
                            "❌ Yetkili Başvurusu Reddedildi"
                        )

                        .setColor(0xED4245)

                        .addFields(

                            {
                                name:
                                    "Reddeden",

                                value:
                                    `<@${interaction.user.id}>`
                            },

                            {
                                name:
                                    "Red Sebebi",

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

                                    .setLabel(
                                        "Onayla"
                                    )

                                    .setStyle(
                                        ButtonStyle.Success
                                    )

                                    .setDisabled(true),

                                new ButtonBuilder()

                                    .setCustomId(
                                        "rejected_disabled"
                                    )

                                    .setLabel(
                                        "Reddedildi"
                                    )

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
                        "❌ Başvuru mesajı güncellenemedi:",
                        messageError
                    );

                }


                return interaction.reply({

                    content:
                        "❌ Başvuru reddedildi.",

                    ephemeral: true

                });

            }

        } catch (error) {

            console.error(
                "❌ Interaction hatası:",
                error
            );


            if (
                !interaction.replied &&
                !interaction.deferred
            ) {

                try {

                    await interaction.reply({

                        content:
                            "❌ İşlem sırasında bir hata oluştu.",

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
        "❌ DISCORD_BOT_TOKEN bulunamadı!"
    );

} else {

    console.log(
        "🔵 Discord Gateway login başlatılıyor..."
    );


    client.login(BOT_TOKEN)

        .then(() => {

            console.log(
                "🟢 Discord login başarılı!"
            );

        })

        .catch((error) => {

            console.error(
                "❌ Discord login başarısız:",
                error
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
            `🌐 MedaV web sunucusu ${PORT} portunda çalışıyor.`
        );

    }
);