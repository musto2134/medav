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

// --------------------------------------------------
// EXPRESS
// --------------------------------------------------

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.get("/health", (req, res) => {
    res.send("MedaV OK");
});

// --------------------------------------------------
// DISCORD CLIENT
// --------------------------------------------------

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// --------------------------------------------------
// YARDIMCI FONKSİYONLAR
// --------------------------------------------------

function createApplicationId() {
    return Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
}

function getEmbedField(embed, name) {
    const field = embed.fields?.find(
        f => f.name.toLowerCase() === name.toLowerCase()
    );

    return field?.value || "Belirtilmedi";
}

// --------------------------------------------------
// YETKİLİ BAŞVURU API
// --------------------------------------------------

app.post("/api/yetkili-basvuru", async (req, res) => {
    try {
        console.log("📩 Yeni yetkili başvurusu alındı.");

        // Discord botunun gerçek hazır durumunu kontrol et
        if (!client.isReady()) {
            console.log("🔴 Discord botu hazır değil.");

            return res.status(503).json({
                success: false,
                message:
                    "Discord botu henüz hazır değil. Birkaç saniye sonra tekrar deneyin."
            });
        }

        const data = req.body || {};

        // --------------------------------------------------
        // FORM KONTROLÜ
        // --------------------------------------------------

        if (!data.discord) {
            return res.status(400).json({
                success: false,
                message: "Discord ID bulunamadı."
            });
        }

        const discordId = String(data.discord).trim();

        if (!/^\d{17,20}$/.test(discordId)) {
            return res.status(400).json({
                success: false,
                message: "Geçerli bir Discord ID girin."
            });
        }

        // --------------------------------------------------
        // BAŞVURU KANALI
        // --------------------------------------------------

        const channel = await client.channels.fetch(
            APPLICATION_CHANNEL_ID
        );

        if (!channel) {
            console.log("🔴 Başvuru kanalı bulunamadı.");

            return res.status(500).json({
                success: false,
                message: "Başvuru kanalı bulunamadı."
            });
        }

        // --------------------------------------------------
        // BAŞVURU BİLGİLERİ
        // --------------------------------------------------

        const applicationId = createApplicationId();

        const discordUsername =
            data.discordUsername ||
            data.username ||
            "Belirtilmedi";

        const age =
            data.age ||
            "Belirtilmedi";

        const activity =
            data.activity ||
            "Belirtilmedi";

        const fivemExperience =
            data.fivemExperience ||
            data.fivem ||
            "Belirtilmedi";

        const characterName =
            data.characterName ||
            data.character ||
            "Belirtilmedi";

        const rpExperience =
            data.rpExperience ||
            data.rp ||
            "Belirtilmedi";

        const whyStaff =
            data.whyStaff ||
            data.reason ||
            "Belirtilmedi";

        // --------------------------------------------------
        // EMBED
        // --------------------------------------------------

        const embed = new EmbedBuilder()
            .setTitle("📋 MedaV Yetkili Başvurusu")
            .setDescription(
                `**Başvuru ID:** \`${applicationId}\`\n\n` +
                "Yeni bir yetkili başvurusu gönderildi."
            )
            .addFields(
                {
                    name: "👤 Discord ID",
                    value: discordId,
                    inline: true
                },
                {
                    name: "💬 Discord Kullanıcı Adı",
                    value: String(discordUsername).substring(0, 1024),
                    inline: true
                },
                {
                    name: "🎂 Yaş",
                    value: String(age).substring(0, 1024),
                    inline: true
                },
                {
                    name: "🕐 Aktiflik",
                    value: String(activity).substring(0, 1024),
                    inline: false
                },
                {
                    name: "🎮 FiveM Deneyimi",
                    value: String(fivemExperience).substring(0, 1024),
                    inline: false
                },
                {
                    name: "👤 Karakter Adı",
                    value: String(characterName).substring(0, 1024),
                    inline: true
                },
                {
                    name: "🎭 RP Deneyimi",
                    value: String(rpExperience).substring(0, 1024),
                    inline: false
                },
                {
                    name: "📝 Neden Yetkili Olmak İstiyorsun?",
                    value: String(whyStaff).substring(0, 1024),
                    inline: false
                }
            )
            .setFooter({
                text: "MedaV Roleplay • Yetkili Başvuru Sistemi"
            })
            .setTimestamp();

        // --------------------------------------------------
        // BUTONLAR
        // --------------------------------------------------

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`application_approve_${applicationId}`)
                .setLabel("Onayla")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(`application_reject_${applicationId}`)
                .setLabel("Reddet")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)
        );

        // --------------------------------------------------
        // DISCORD'A GÖNDER
        // --------------------------------------------------

        const message = await channel.send({
            embeds: [embed],
            components: [buttons]
        });

        console.log(
            `🟢 Başvuru Discord'a gönderildi: ${applicationId}`
        );

        return res.json({
            success: true,
            message: "Başvurunuz başarıyla gönderildi.",
            applicationId: applicationId,
            discordMessageId: message.id
        });

    } catch (error) {
        console.error("🔴 Yetkili başvuru hatası:", error);

        return res.status(500).json({
            success: false,
            message: "Başvuru gönderilirken bir hata oluştu."
        });
    }
});

// --------------------------------------------------
// DISCORD BUTON / MODAL İŞLEMLERİ
// --------------------------------------------------

client.on("interactionCreate", async interaction => {
    try {

        // --------------------------------------------------
        // BUTON
        // --------------------------------------------------

        if (interaction.isButton()) {

            const member = interaction.member;

            // Yetkili rolü kontrolü
            if (
                !member ||
                !member.roles ||
                !member.roles.cache.has(STAFF_ROLE_ID)
            ) {
                return interaction.reply({
                    content:
                        "❌ Bu işlemi yapmak için gerekli yetkiye sahip değilsiniz.",
                    ephemeral: true
                });
            }

            // --------------------------------------------------
            // ONAYLA
            // --------------------------------------------------

            if (
                interaction.customId.startsWith(
                    "application_approve_"
                )
            ) {

                const applicationId =
                    interaction.customId.replace(
                        "application_approve_",
                        ""
                    );

                const embed =
                    interaction.message.embeds[0];

                if (!embed) {
                    return interaction.reply({
                        content: "❌ Başvuru bilgisi bulunamadı.",
                        ephemeral: true
                    });
                }

                const discordId =
                    getEmbedField(embed, "👤 Discord ID");

                try {

                    const user =
                        await client.users.fetch(discordId);

                    await user.send(
                        `Merhaba!\n\n` +
                        `MedaV Roleplay yetkili başvurun **ONAYLANDI**. ✅\n\n` +
                        `Başvuru ID: \`${applicationId}\`\n\n` +
                        `Yetkili ekip sizinle Discord üzerinden iletişime geçecektir.`
                    );

                } catch (dmError) {

                    console.log(
                        "⚠️ Kullanıcıya DM gönderilemedi:",
                        dmError.message
                    );
                }

                const updatedEmbed =
                    EmbedBuilder.from(embed)
                        .setTitle("✅ MedaV Yetkili Başvurusu • ONAYLANDI")
                        .setColor(0x57f287)
                        .setFooter({
                            text:
                                `Onaylayan: ${interaction.user.tag}`
                        });

                const disabledButtons =
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId(
                                `application_approve_${applicationId}`
                            )
                            .setLabel("Onaylandı")
                            .setEmoji("✅")
                            .setStyle(ButtonStyle.Success)
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setCustomId(
                                `application_reject_${applicationId}`
                            )
                            .setLabel("Reddet")
                            .setEmoji("❌")
                            .setStyle(ButtonStyle.Danger)
                            .setDisabled(true)
                    );

                await interaction.update({
                    embeds: [updatedEmbed],
                    components: [disabledButtons]
                });

                console.log(
                    `🟢 Başvuru onaylandı: ${applicationId}`
                );

                return;
            }

            // --------------------------------------------------
            // REDDET
            // --------------------------------------------------

            if (
                interaction.customId.startsWith(
                    "application_reject_"
                )
            ) {

                const applicationId =
                    interaction.customId.replace(
                        "application_reject_",
                        ""
                    );

                const modal =
                    new ModalBuilder()
                        .setCustomId(
                            `application_reject_modal_${applicationId}_${interaction.message.id}`
                        )
                        .setTitle("Yetkili Başvurusu Reddet");

                const reasonInput =
                    new TextInputBuilder()
                        .setCustomId("reject_reason")
                        .setLabel("Red sebebi")
                        .setStyle(TextInputStyle.Paragraph)
                        .setPlaceholder(
                            "Başvurunun neden reddedildiğini yazın..."
                        )
                        .setRequired(true)
                        .setMaxLength(1000);

                const row =
                    new ActionRowBuilder().addComponents(
                        reasonInput
                    );

                modal.addComponents(row);

                await interaction.showModal(modal);

                return;
            }
        }

        // --------------------------------------------------
        // MODAL
        // --------------------------------------------------

        if (interaction.isModalSubmit()) {

            if (
                !interaction.customId.startsWith(
                    "application_reject_modal_"
                )
            ) {
                return;
            }

            const parts =
                interaction.customId.split("_");

            const applicationId = parts[3];
            const messageId = parts[4];

            const reason =
                interaction.fields.getTextInputValue(
                    "reject_reason"
                );

            const channel =
                await client.channels.fetch(
                    APPLICATION_CHANNEL_ID
                );

            const message =
                await channel.messages.fetch(messageId);

            const embed =
                message.embeds[0];

            if (!embed) {
                return interaction.reply({
                    content:
                        "❌ Başvuru bilgisi bulunamadı.",
                    ephemeral: true
                });
            }

            const discordId =
                getEmbedField(
                    embed,
                    "👤 Discord ID"
                );

            // --------------------------------------------------
            // DM
            // --------------------------------------------------

            try {

                const user =
                    await client.users.fetch(discordId);

                await user.send(
                    `Merhaba!\n\n` +
                    `MedaV Roleplay yetkili başvurun **REDDEDİLDİ**. ❌\n\n` +
                    `Başvuru ID: \`${applicationId}\`\n\n` +
                    `**Red sebebi:**\n${reason}`
                );

            } catch (dmError) {

                console.log(
                    "⚠️ Kullanıcıya red DM'si gönderilemedi:",
                    dmError.message
                );
            }

            // --------------------------------------------------
            // EMBED GÜNCELLE
            // --------------------------------------------------

            const updatedEmbed =
                EmbedBuilder.from(embed)
                    .setTitle(
                        "❌ MedaV Yetkili Başvurusu • REDDEDİLDİ"
                    )
                    .setColor(0xed4245)
                    .addFields({
                        name: "📌 Red Sebebi",
                        value: reason.substring(0, 1024),
                        inline: false
                    })
                    .setFooter({
                        text:
                            `Reddeden: ${interaction.user.tag}`
                    });

            const disabledButtons =
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(
                            `application_approve_${applicationId}`
                        )
                        .setLabel("Onayla")
                        .setEmoji("✅")
                        .setStyle(ButtonStyle.Success)
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId(
                            `application_reject_${applicationId}`
                        )
                        .setLabel("Reddedildi")
                        .setEmoji("❌")
                        .setStyle(ButtonStyle.Danger)
                        .setDisabled(true)
                );

            await message.edit({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });

            await interaction.reply({
                content:
                    `❌ Başvuru reddedildi.\nBaşvuru ID: \`${applicationId}\``,
                ephemeral: true
            });

            console.log(
                `🔴 Başvuru reddedildi: ${applicationId}`
            );
        }

    } catch (error) {

        console.error(
            "🔴 Interaction hatası:",
            error
        );

        try {

            if (interaction.replied || interaction.deferred) {

                await interaction.followUp({
                    content:
                        "❌ İşlem sırasında bir hata oluştu.",
                    ephemeral: true
                });

            } else {

                await interaction.reply({
                    content:
                        "❌ İşlem sırasında bir hata oluştu.",
                    ephemeral: true
                });

            }

        } catch {}
    }
});

// --------------------------------------------------
// DISCORD READY
// --------------------------------------------------

client.once("ready", () => {

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

// --------------------------------------------------
// DISCORD HATALARI
// --------------------------------------------------

client.on("error", error => {

    console.error(
        "🔴 Discord Client Hatası:",
        error
    );

});

client.on("shardError", error => {

    console.error(
        "🔴 Discord Shard Hatası:",
        error
    );

});

// --------------------------------------------------
// BOT LOGIN
// --------------------------------------------------

if (!BOT_TOKEN) {

    console.error(
        "🔴 DISCORD_BOT_TOKEN bulunamadı!"
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
        .catch(error => {

            console.error(
                "🔴 Discord login başarısız:",
                error.message
            );

        });
}

// --------------------------------------------------
// WEB SERVER
// --------------------------------------------------

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `🌐 MedaV web sunucusu ${PORT} portunda çalışıyor.`
    );

});