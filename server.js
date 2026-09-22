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

// ===============================
// TOKEN KONTROLÜ
// ===============================

if (!BOT_TOKEN) {
console.error("❌ DISCORD_BOT_TOKEN Render Environment Variables içinde bulunamadı!");
process.exit(1);
}

// ===============================
// EXPRESS
// ===============================

app.use(express.json({ limit: "1mb" }));

app.use(express.static(__dirname));

app.get("/", (req, res) => {
res.sendFile(__dirname + "/index.html");
});

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
// BAŞVURU GÖNDERME
// ===============================

app.post("/api/yetkili-basvuru", async (req, res) => {

```
try {

    // Discord bot hazır değilse
    if (!client.isReady()) {

        return res.status(503).json({
            success: false,
            message:
                "Discord botu henüz hazır değil. Birkaç saniye sonra tekrar deneyin."
        });

    }


    const data = req.body || {};


    // Discord ID kontrolü
    if (!data.discord) {

        return res.status(400).json({
            success: false,
            message: "Discord ID bulunamadı."
        });

    }


    const discordId = String(data.discord).trim();


    // Discord ID formatı
    if (!/^\d{17,20}$/.test(discordId)) {

        return res.status(400).json({
            success: false,
            message:
                "Geçerli bir Discord Kullanıcı ID'si girin."
        });

    }


    // Kanalı bul
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


    // Başvuru ID
    const applicationId = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();


    // ===============================
    // EMBED
    // ===============================

    const embed = new EmbedBuilder()
        .setTitle("📋 MedaV Yetkili Başvurusu")
        .setDescription(
            `**Başvuru ID:** \`${applicationId}\`\n\n` +
            "Yeni bir yetkili başvurusu gönderildi."
        )
        .addFields(

            {
                name: "👤 Discord ID",
                value: `\`${discordId}\``,
                inline: true
            },

            {
                name: "🎮 Discord Kullanıcı Adı",
                value:
                    String(
                        data.discordUsername ||
                        data.username ||
                        "Belirtilmedi"
                    ),
                inline: true
            },

            {
                name: "🎂 Yaş",
                value:
                    String(data.age || "Belirtilmedi"),
                inline: true
            },

            {
                name: "⏱️ Günlük Aktivite",
                value:
                    String(
                        data.activity ||
                        "Belirtilmedi"
                    ),
                inline: true
            },

            {
                name: "🎮 FiveM Deneyimi",
                value:
                    String(
                        data.fivemExperience ||
                        data.fivem ||
                        "Belirtilmedi"
                    ),
                inline: true
            },

            {
                name: "🧑 Karakter Adı",
                value:
                    String(
                        data.characterName ||
                        data.character ||
                        "Belirtilmedi"
                    ),
                inline: true
            },

            {
                name: "🎭 RP Deneyimi",
                value:
                    String(
                        data.rpExperience ||
                        data.rp ||
                        "Belirtilmedi"
                    ),
                inline: false
            },

            {
                name: "⭐ Neden Yetkili Olmak İstiyorsun?",
                value:
                    String(
                        data.whyStaff ||
                        data.reason ||
                        "Belirtilmedi"
                    ),
                inline: false
            }

        )
        .setFooter({
            text: "MedaV Yetkili Başvuru Sistemi"
        })
        .setTimestamp();


    // ===============================
    // BUTONLAR
    // ===============================

    const buttons = new ActionRowBuilder()
        .addComponents(

            new ButtonBuilder()
                .setCustomId(
                    `medav_approve_${applicationId}`
                )
                .setLabel("Onayla")
                .setEmoji("✅")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId(
                    `medav_reject_${applicationId}`
                )
                .setLabel("Reddet")
                .setEmoji("❌")
                .setStyle(ButtonStyle.Danger)

        );


    // Discord'a gönder
    const message = await channel.send({
        embeds: [embed],
        components: [buttons]
    });


    console.log(
        `📨 Yeni yetkili başvurusu gönderildi: ${applicationId} | Mesaj: ${message.id}`
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
```

});

// ===============================
// DISCORD ETKİLEŞİMLERİ
// ===============================

client.on("interactionCreate", async (interaction) => {

```
try {

    // ===============================
    // BUTON
    // ===============================

    if (interaction.isButton()) {

        const customId = interaction.customId;


        // Sadece MedaV Yönetim kullanabilir
        if (
            !interaction.member ||
            !interaction.member.roles.cache.has(
                STAFF_ROLE_ID
            )
        ) {

            return interaction.reply({
                content:
                    "❌ Bu işlemi yapmak için MedaV Yönetim yetkisine sahip olmalısın.",
                ephemeral: true
            });

        }


        // ===============================
        // ONAYLA
        // ===============================

        if (
            customId.startsWith(
                "medav_approve_"
            )
        ) {

            const applicationId =
                customId.replace(
                    "medav_approve_",
                    ""
                );


            const embed =
                interaction.message.embeds[0];


            if (!embed) {

                return interaction.reply({
                    content:
                        "❌ Başvuru bilgileri bulunamadı.",
                    ephemeral: true
                });

            }


            // Discord ID'yi embed'den al
            const discordField =
                embed.fields?.find(
                    field =>
                        field.name === "👤 Discord ID"
                );


            if (!discordField) {

                return interaction.reply({
                    content:
                        "❌ Başvuru sahibinin Discord ID'si bulunamadı.",
                    ephemeral: true
                });

            }


            const discordId =
                discordField.value
                    .replace(/`/g, "")
                    .trim();


            await interaction.deferReply({
                ephemeral: true
            });


            try {

                const user =
                    await client.users.fetch(
                        discordId
                    );


                await user.send(
                    `🎉 **MedaV Yetkili Başvurun Onaylandı!**\n\n` +
                    `Başvuru ID: **${applicationId}**\n\n` +
                    `Yetkili ekibine katılımın için yönetim ekibi seninle iletişime geçecektir.`
                );


            } catch (dmError) {

                console.error(
                    "⚠️ Onay DM hatası:",
                    dmError
                );

            }


            const updatedEmbed =
                EmbedBuilder.from(embed)
                    .setTitle(
                        "✅ MedaV Yetkili Başvurusu - ONAYLANDI"
                    )
                    .setColor(0x57F287)
                    .setFooter({
                        text:
                            "MedaV Yetkili Başvuru Sistemi"
                    });


            const disabledButtons =
                new ActionRowBuilder()
                    .addComponents(

                        new ButtonBuilder()
                            .setCustomId(
                                `medav_approved_${applicationId}`
                            )
                            .setLabel("Onaylandı")
                            .setEmoji("✅")
                            .setStyle(
                                ButtonStyle.Success
                            )
                            .setDisabled(true),

                        new ButtonBuilder()
                            .setCustomId(
                                `medav_rejected_disabled_${applicationId}`
                            )
                            .setLabel("Reddet")
                            .setEmoji("❌")
                            .setStyle(
                                ButtonStyle.Danger
                            )
                            .setDisabled(true)

                    );


            await interaction.message.edit({
                embeds: [updatedEmbed],
                components: [disabledButtons]
            });


            return interaction.editReply({
                content:
                    `✅ **${applicationId}** numaralı başvuru onaylandı.`
            });

        }


        // ===============================
        // REDDET
        // ===============================

        if (
            customId.startsWith(
                "medav_reject_"
            )
        ) {

            const applicationId =
                customId.replace(
                    "medav_reject_",
                    ""
                );


            const modal =
                new ModalBuilder()
                    .setCustomId(
                        `medav_reject_modal_${applicationId}_${interaction.message.id}`
                    )
                    .setTitle(
                        "MedaV Başvuru Reddi"
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


            return interaction.showModal(
                modal
            );

        }

    }


    // ===============================
    // MODAL
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
                    "❌ Bu işlemi yapmak için MedaV Yönetim yetkisine sahip olmalısın.",
                ephemeral: true
            });

        }


        const parts =
            interaction.customId.split("_");


        const applicationId =
            parts[3];


        const messageId =
            parts[4];


        const reason =
            interaction.fields.getTextInputValue(
                "reject_reason"
            );


        await interaction.deferReply({
            ephemeral: true
        });


        // Başvuru kanalını bul
        const channel =
            await client.channels.fetch(
                APPLICATION_CHANNEL_ID
            );


        if (!channel || !channel.isTextBased()) {

            return interaction.editReply({
                content:
                    "❌ Başvuru kanalı bulunamadı."
            });

        }


        // Eski başvuru mesajını bul
        const message =
            await channel.messages.fetch(
                messageId
            );


        const embed =
            message.embeds[0];


        if (!embed) {

            return interaction.editReply({
                content:
                    "❌ Başvuru embed'i bulunamadı."
            });

        }


        // Discord ID
        const discordField =
            embed.fields?.find(
                field =>
                    field.name === "👤 Discord ID"
            );


        if (!discordField) {

            return interaction.editReply({
                content:
                    "❌ Başvuru sahibinin Discord ID'si bulunamadı."
            });

        }


        const discordId =
            discordField.value
                .replace(/`/g, "")
                .trim();


        // Kullanıcıya DM
        try {

            const user =
                await client.users.fetch(
                    discordId
                );


            await user.send(
                `❌ **MedaV Yetkili Başvurun Reddedildi.**\n\n` +
                `Başvuru ID: **${applicationId}**\n\n` +
                `**Red Sebebi:**\n${reason}`
            );


        } catch (dmError) {

            console.error(
                "⚠️ Red DM hatası:",
                dmError
            );

        }


        // Embed güncelle
        const updatedEmbed =
            EmbedBuilder.from(embed)
                .setTitle(
                    "❌ MedaV Yetkili Başvurusu - REDDEDİLDİ"
                )
                .setColor(0xED4245)
                .addFields({
                    name: "📝 Red Sebebi",
                    value: reason,
                    inline: false
                })
                .setFooter({
                    text:
                        "MedaV Yetkili Başvuru Sistemi"
                });


        // Butonları kapat
        const disabledButtons =
            new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId(
                            `medav_approved_disabled_${applicationId}`
                        )
                        .setLabel("Onayla")
                        .setEmoji("✅")
                        .setStyle(
                            ButtonStyle.Success
                        )
                        .setDisabled(true),

                    new ButtonBuilder()
                        .setCustomId(
                            `medav_rejected_${applicationId}`
                        )
                        .setLabel("Reddedildi")
                        .setEmoji("❌")
                        .setStyle(
                            ButtonStyle.Danger
                        )
                        .setDisabled(true)

                );


        await message.edit({
            embeds: [updatedEmbed],
            components: [disabledButtons]
        });


        return interaction.editReply({
            content:
                `❌ **${applicationId}** numaralı başvuru reddedildi.`
        });

    }

} catch (error) {

    console.error(
        "❌ Interaction hatası:",
        error
    );


    if (!interaction.replied && !interaction.deferred) {

        try {

            await interaction.reply({
                content:
                    "❌ İşlem sırasında bir hata oluştu.",
                ephemeral: true
            });

        } catch {}

    }

}
```

});

// ===============================
// DISCORD READY
// ===============================

client.once("clientReady", () => {

```
console.log(
    "================================="
);

console.log(
    "       MEDAV ROLEPLAY"
);

console.log(
    "   Yetkili Başvuru Sistemi"
);

console.log(
    "================================="
);

console.log(
    "🤖 Discord Bot: " +
    client.user.tag
);

console.log(
    "🟢 Discord botu başarıyla bağlandı."
);

console.log(
    "🟢 Discord Gateway tamamen hazır."
);
```

});

// ===============================
// DISCORD HATALARI
// ===============================

client.on("error", (error) => {

```
console.error(
    "🔴 DISCORD CLIENT HATASI:"
);

console.error(error);
```

});

client.on("shardError", (error) => {

```
console.error(
    "🔴 DISCORD SHARD HATASI:"
);

console.error(error);
```

});

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

client.login(BOT_TOKEN)
.then(() => {

```
    console.log(
        "🟢 Discord login başarılı!"
    );

})
.catch((error) => {

    console.error(
        "🔴 DISCORD LOGIN HATASI:"
    );

    console.error(error);

});
```

// ===============================
// WEB SERVER
// ===============================

app.listen(
PORT,
"0.0.0.0",
() => {

```
    console.log(
        "🌐 MedaV site çalışıyor. Port: " +
        PORT
    );

}
```

);