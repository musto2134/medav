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

// ===============================
// AYARLAR
// ===============================

const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN?.trim();

const APPLICATION_CHANNEL_ID = "1551815098170081401";
const STAFF_ROLE_ID = "1551830696111243295";

// ===============================
// TOKEN KONTROLÜ
// ===============================

if (!BOT_TOKEN) {
    console.error(
        "DISCORD_BOT_TOKEN Render Environment Variables içinde bulunamadı!"
    );
    process.exit(1);
}

// ===============================
// EXPRESS
// ===============================

app.use(express.json({ limit: "1mb" }));
app.use(express.static(__dirname));

// ===============================
// ANA SAYFA
// ===============================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

// ===============================
// SAĞLIK KONTROLÜ
// ===============================

app.get("/health", (req, res) => {
    res.status(200).send("MedaV OK");
});

// ===============================
// DISCORD CLIENT
// ===============================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds
    ]
});

// ===============================
// YETKİLİ BAŞVURUSU
// ===============================

app.post("/api/yetkili-basvuru", async (req, res) => {
    try {

        if (!client.isReady()) {
            return res.status(503).json({
                success: false,
                message:
                    "Discord botu henüz hazır değil. Birkaç saniye sonra tekrar deneyin."
            });
        }

        const data = req.body || {};

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
                message:
                    "Geçerli bir Discord Kullanıcı ID'si girin."
            });
        }

        const channel = await client.channels.fetch(
            APPLICATION_CHANNEL_ID
        );

        if (!channel) {
            throw new Error("Başvuru kanalı bulunamadı.");
        }

        if (!channel.isTextBased()) {
            throw new Error(
                "Başvuru kanalı mesaj gönderilebilen bir kanal değil."
            );
        }

        const applicationId = Math.random()
            .toString(36)
            .substring(2, 8)
            .toUpperCase();

        const description =
            "**Başvuru No:** `" + applicationId + "`\n" +
            "**Durum:** 🟡 Beklemede\n\n" +

            "**👤 İsim:** " + (data.isim || "-") + "\n" +
            "**🎂 Yaş:** " + (data.yas || "-") + "\n" +
            "**🎮 Discord ID:** `" + discordId + "`\n" +
            "**🎮 FiveM Adı:** " + (data.fivem || "-") + "\n\n" +

            "**⏰ Aktiflik:** " + (data.aktiflik || "-") + "\n" +
            "**📚 Yetkili Deneyimi:** " + (data.deneyim || "-") + "\n" +
            "**🌐 Önceki Sunucular:** " + (data.sunucular || "-") + "\n\n" +

            "**❓ Neden Yetkili Olmak İstiyor:** " + (data.neden || "-") + "\n" +
            "**⭐ Neden Seni Seçmeliyiz:** " + (data.tercih || "-") + "\n" +
            "**🎭 RP Bilgisi:** " + (data.rp || "-") + "\n" +
            "**⚖️ Tartışma Yaklaşımı:** " + (data.tartisma || "-") + "\n" +
            "**🛡️ Tarafsızlık:** " + (data.tarafsizlik || "-") + "\n" +
            "**🤝 Anlaşmazlık Çözümü:** " + (data.anlasmazlik || "-") + "\n\n" +

            "**📝 Ek Bilgi:** " + (data.ek || "-");

        const embed = new EmbedBuilder()
            .setTitle("📋 MedaV Yetkili Başvurusu")
            .setDescription(description)
            .setColor(0xF1C40F)
            .setFooter({
                text: "MedaV Roleplay • Yetkili Başvuru Sistemi"
            })
            .setTimestamp();

        const buttons = new ActionRowBuilder().addComponents(

            new ButtonBuilder()
                .setCustomId(
                    "medav_approve_" + applicationId
                )
                .setLabel("Onayla")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(
                    "medav_reject_" + applicationId
                )
                .setLabel("Reddet")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)

        );

        await channel.send({
            embeds: [embed],
            components: [buttons]
        });

        console.log(
            "📨 Yeni başvuru: " +
            applicationId +
            " | Discord ID: " +
            discordId
        );

        return res.json({
            success: true,
            applicationId: applicationId
        });

    } catch (error) {

        console.error(
            "❌ Başvuru gönderme hatası:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                "Başvuru gönderilirken bir hata oluştu."
        });
    }
});

// ===============================
// DISCORD ETKİLEŞİMLERİ
// ===============================

client.on("interactionCreate", async (interaction) => {

    // ===============================
    // BUTONLAR
    // ===============================

    if (interaction.isButton()) {

        if (
            !interaction.member ||
            !interaction.member.roles.cache.has(
                STAFF_ROLE_ID
            )
        ) {
            return interaction.reply({
                content:
                    "❌ Bu işlemi yapmak için MedaV Yönetim rolüne sahip olmalısınız.",
                ephemeral: true
            });
        }

        // ===============================
        // ONAYLA
        // ===============================

        if (
            interaction.customId.startsWith(
                "medav_approve_"
            )
        ) {

            await interaction.deferUpdate();

            try {

                const applicationId =
                    interaction.customId.replace(
                        "medav_approve_",
                        ""
                    );

                const oldEmbed =
                    interaction.message.embeds[0];

                if (!oldEmbed) {
                    return;
                }

                const description =
                    oldEmbed.description || "";

                const discordMatch =
                    description.match(
                        /\*\*🎮 Discord ID:\*\* `(\d{17,20})`/
                    );

                if (!discordMatch) {

                    return interaction.followUp({
                        content:
                            "❌ Başvurudaki Discord ID bulunamadı.",
                        ephemeral: true
                    });
                }

                const discordId =
                    discordMatch[1];

                let dmSuccess = true;

                try {

                    const user =
                        await client.users.fetch(
                            discordId
                        );

                    await user.send(
                        "🎉 **MedaV Roleplay**\n\n" +
                        "Yetkili başvurunuz **ONAYLANDI!**\n\n" +
                        "Başvuru No: `" +
                        applicationId +
                        "`\n\n" +
                        "MedaV Yönetim ekibine hoş geldiniz."
                    );

                } catch (dmError) {

                    console.error(
                        "DM gönderilemedi:",
                        dmError
                    );

                    dmSuccess = false;
                }

                const updatedDescription =
                    description.replace(
                        "**Durum:** 🟡 Beklemede",
                        "**Durum:** 🟢 ONAYLANDI"
                    ) +
                    "\n\n**Onaylayan:** " +
                    interaction.user;

                const updatedEmbed =
                    EmbedBuilder.from(oldEmbed)
                        .setColor(0x2ECC71)
                        .setDescription(
                            updatedDescription
                        );

                const disabledButtons =
                    new ActionRowBuilder().addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                "medav_approve_" +
                                applicationId
                            )
                            .setLabel("Onaylandı")
                            .setEmoji("✅")
                            .setStyle(
                                ButtonStyle.Success
                            )
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setCustomId(
                                "medav_reject_" +
                                applicationId
                            )
                            .setLabel("Reddet")
                            .setEmoji("❌")
                            .setStyle(
                                ButtonStyle.Danger
                            )
                            .setDisabled(true)

                    );

                await interaction.editReply({
                    embeds: [updatedEmbed],
                    components: [disabledButtons]
                });

                if (!dmSuccess) {

                    await interaction.followUp({
                        content:
                            "⚠️ Başvuru onaylandı ancak kullanıcıya DM gönderilemedi.",
                        ephemeral: true
                    });
                }

            } catch (error) {

                console.error(
                    "❌ Onaylama hatası:",
                    error
                );

                try {

                    await interaction.followUp({
                        content:
                            "❌ Başvuru onaylanırken hata oluştu.",
                        ephemeral: true
                    });

                } catch {}

            }

            return;
        }

        // ===============================
        // REDDET
        // ===============================

        if (
            interaction.customId.startsWith(
                "medav_reject_"
            )
        ) {

            const applicationId =
                interaction.customId.replace(
                    "medav_reject_",
                    ""
                );

            const modal =
                new ModalBuilder()
                    .setCustomId(
                        "medav_reject_modal_" +
                        applicationId
                    )
                    .setTitle(
                        "Yetkili Başvurusunu Reddet"
                    );

            const reasonInput =
                new TextInputBuilder()
                    .setCustomId(
                        "reject_reason"
                    )
                    .setLabel(
                        "Red sebebi"
                    )
                    .setPlaceholder(
                        "Başvurunun neden reddedildiğini yazın..."
                    )
                    .setStyle(
                        TextInputStyle.Paragraph
                    )
                    .setRequired(true)
                    .setMinLength(3)
                    .setMaxLength(1000);

            const row =
                new ActionRowBuilder()
                    .addComponents(
                        reasonInput
                    );

            modal.addComponents(row);

            await interaction.showModal(
                modal
            );

            return;
        }
    }

    // ===============================
    // RED MODALI
    // ===============================

    if (interaction.isModalSubmit()) {

        if (
            !interaction.customId.startsWith(
                "medav_reject_modal_"
            )
        ) {
            return;
        }

        if (
            !interaction.member ||
            !interaction.member.roles.cache.has(
                STAFF_ROLE_ID
            )
        ) {

            return interaction.reply({
                content:
                    "❌ Bu işlemi yapmak için MedaV Yönetim rolüne sahip olmalısınız.",
                ephemeral: true
            });
        }

        const applicationId =
            interaction.customId.replace(
                "medav_reject_modal_",
                ""
            );

        const reason =
            interaction.fields.getTextInputValue(
                "reject_reason"
            );

        await interaction.deferUpdate();

        try {

            const oldEmbed =
                interaction.message.embeds[0];

            if (!oldEmbed) {
                return;
            }

            const description =
                oldEmbed.description || "";

            const discordMatch =
                description.match(
                    /\*\*🎮 Discord ID:\*\* `(\d{17,20})`/
                );

            if (!discordMatch) {

                await interaction.followUp({
                    content:
                        "❌ Başvurudaki Discord ID bulunamadı.",
                    ephemeral: true
                });

                return;
            }

            const discordId =
                discordMatch[1];

            let dmSuccess = true;

            try {

                const user =
                    await client.users.fetch(
                        discordId
                    );

                await user.send(
                    "❌ **MedaV Roleplay**\n\n" +
                    "Yetkili başvurunuz **reddedildi.**\n\n" +
                    "Başvuru No: `" +
                    applicationId +
                    "`\n\n" +
                    "**Red Sebebi:**\n" +
                    reason +
                    "\n\n" +
                    "İlerleyen dönemlerde tekrar başvuru yapabilirsiniz."
                );

            } catch (dmError) {

                console.error(
                    "DM gönderilemedi:",
                    dmError
                );

                dmSuccess = false;
            }

            const updatedDescription =
                description.replace(
                    "**Durum:** 🟡 Beklemede",
                    "**Durum:** 🔴 REDDEDİLDİ"
                ) +
                "\n\n**Red Sebebi:** " +
                reason +
                "\n**Reddeden:** " +
                interaction.user;

            const updatedEmbed =
                EmbedBuilder.from(oldEmbed)
                    .setColor(0xE74C3C)
                    .setDescription(
                        updatedDescription
                    );

            const disabledButtons =
                new ActionRowBuilder().addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            "medav_approve_" +
                            applicationId
                        )
                        .setLabel("Onayla")
                        .setEmoji("✅")
                        .setStyle(
                            ButtonStyle.Success
                        )
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId(
                            "medav_reject_" +
                            applicationId
                        )
                        .setLabel("Reddedildi")
                        .setEmoji("❌")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(true)

                );

            await interaction.editReply({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });

            if (!dmSuccess) {

                await interaction.followUp({
                    content:
                        "⚠️ Başvuru reddedildi ancak kullanıcıya DM gönderilemedi.",
                    ephemeral: true
                });
            }

        } catch (error) {

            console.error(
                "❌ Reddetme hatası:",
                error
            );

            try {

                await interaction.followUp({
                    content:
                        "❌ Başvuru reddedilirken hata oluştu.",
                    ephemeral: true
                });

            } catch {}

        }
    }
});

// ===============================
// DISCORD HAZIR
// ===============================

client.once("clientReady", () => {

    console.log("");
    console.log("=================================");
    console.log("       MEDAV ROLEPLAY");
    console.log("   Yetkili Başvuru Sistemi");
    console.log("=================================");
    console.log("");

    console.log(
        "🤖 Discord Bot: " +
        client.user.tag
    );

    console.log(
        "🟢 Discord botu başarıyla bağlandı."
    );

    console.log("");
});

// ===============================
// DISCORD HATA / DEBUG
// ===============================

client.on("error", (error) => {

    console.error(
        "🔴 DISCORD CLIENT ERROR:"
    );

    console.error(error);
});

client.on("shardError", (error) => {

    console.error(
        "🔴 DISCORD SHARD ERROR:"
    );

    console.error(error);
});

client.on("warn", (message) => {

    console.warn(
        "🟡 DISCORD WARN:",
        message
    );
});

client.on("debug", (message) => {

    console.log(
        "🔧 DISCORD DEBUG:",
        message
    );
});

// ===============================
// WEB SUNUCUSU
// ===============================

app.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            "🌐 MedaV site çalışıyor. Port: " +
            PORT
        );

        console.log(
            "🔗 Sunucu adresi: http://0.0.0.0:" +
            PORT
        );
    }
);

// ===============================
// DISCORD LOGIN
// ===============================

console.log(
    "🔵 Discord login başlatılıyor..."
);

console.log(
    "🔵 Discord token bulundu:",
    !!BOT_TOKEN
);

console.log(
    "🔵 Discord bağlantı testi hazırlanıyor..."
);

client.login(BOT_TOKEN)
    .then(() => {

        console.log(
            "🟢 Discord login başarılı!"
        );

        console.log(
            "🟢 Discord Gateway bağlantısı başlatıldı."
        );

    })
    .catch((error) => {

        console.error(
            "🔴 DISCORD LOGIN HATASI:"
        );

        console.error(error);

    });

// ===============================
// 30 SANİYE KONTROLÜ
// ===============================

setTimeout(() => {

    if (!client.isReady()) {

        console.error(
            "⏰ DISCORD BAĞLANTISI 30 SANİYE İÇİNDE HAZIR OLMADI!"
        );

        console.error(
            "⏰ Discord Gateway bağlantısında bekliyor olabilir."
        );
    }

}, 30000);

// ===============================
// GENEL HATA YAKALAMA
// ===============================

process.on("unhandledRejection", (error) => {

    console.error(
        "❌ UNHANDLED REJECTION:"
    );

    console.error(error);
});

process.on("uncaughtException", (error) => {

    console.error(
        "❌ UNCAUGHT EXCEPTION:"
    );

    console.error(error);
});