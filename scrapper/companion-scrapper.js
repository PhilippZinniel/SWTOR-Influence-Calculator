import puppeteer from "puppeteer";
import fs from "fs";

(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    console.log("Navigating to companions page...");
    await page.goto("https://swtorista.com/companions", {
        waitUntil: "domcontentloaded",
    });

    // Step 1: Get companion list, ignoring spoiler-companions
    const companions = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll(".armorcategory"));
        return items
            .filter(div => !div.classList.contains("spoiler-companion"))
            .map(div => {
                const aTag = div.querySelector("a");
                const imgTag = div.querySelector("img");
                const nameTag = div.querySelector("b");

                return {
                    href: aTag ? aTag.href : null,
                    img: imgTag ? imgTag.src : null,
                    name: nameTag ? nameTag.innerText.trim() : null,
                    gifts: []
                };
            });
    });

    console.log(`Found ${companions.length} companions (excluding spoilers).`);

    // Step 2: Loop through companions
    for (let i = 0; i < companions.length; i++) {
        const companion = companions[i];
        console.log(`\n[${i + 1}/${companions.length}] Processing companion: ${companion.name}`);

        if (!companion.href) {
            console.log("  ⚠️ No href found, skipping.");
            continue;
        }

        await page.goto(companion.href, { waitUntil: "domcontentloaded" });
        console.log(`  Navigated to ${companion.href}`);

        const gifts = await page.evaluate(() => {
            const table = document.querySelector(".table-individual-gifts");
            if (!table) return [];

            const tbody = table.querySelector("tbody");
            if (!tbody) return [];

            const rarityMap = {
                "gift-quality-artifact": "Artifact",
                "gift-quality-prototype": "Prototype",
                "gift-quality-premium": "Premium"
            };

            const results = [];

            for (const [cls, rarity] of Object.entries(rarityMap)) {
                const rows = Array.from(tbody.querySelectorAll(`tr.${cls}`));
                if (rows.length === 0) continue;

                let selectedRow = null;

                // Try Fleet Companion Gifts Vendor first
                for (const row of rows) {
                    const tds = row.querySelectorAll("td");
                    const lastTd = tds[tds.length - 1];
                    if (lastTd && lastTd.innerText.includes("Fleet Companion Gifts Vendor")) {
                        selectedRow = row;
                        break;
                    }
                }

                // Fallback to first row
                if (!selectedRow) {
                    selectedRow = rows[0];
                }

                if (selectedRow) {
                    const tds = selectedRow.querySelectorAll("td");
                    const img = tds[0]?.querySelector("img")?.src || null;
                    const name = tds[1]?.querySelector("b")?.innerText.trim() || null;

                    results.push({
                        rarity,
                        img,
                        name
                    });
                }
            }

            return results;
        });

        if (gifts.length > 0) {
            console.log(`  ✅ Found ${gifts.length} gifts for ${companion.name}`);
        } else {
            console.log(`  ⚠️ No gifts found for ${companion.name}`);
        }

        companion.gifts = gifts;

        // Slow down to avoid hammering the site
        await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("\nTransforming results into template format...");

    // Step 3: Reshape to template
    const result = {
        companions: companions.map((c, index) => {
            const artifact = c.gifts.find(g => g.rarity === "Artifact") || {};
            const prototype = c.gifts.find(g => g.rarity === "Prototype") || {};
            const premium = c.gifts.find(g => g.rarity === "Premium") || {};

            return {
                id: String(index + 1),
                name: c.name || "",
                imageUrl: c.img || "",
                gifts: {
                    artifact: {
                        name: artifact.name || "",
                        type: "Artifact",
                        imageUrl: artifact.img || ""
                    },
                    prototype: {
                        name: prototype.name || "",
                        type: "Prototype",
                        imageUrl: prototype.img || ""
                    },
                    premium: {
                        name: premium.name || "",
                        type: "Premium",
                        imageUrl: premium.img || ""
                    }
                }
            };
        })
    };

    // Step 4: Write to companions.json
    fs.writeFileSync("../src/lib/data/companions.json", JSON.stringify(result, null, 2));
    console.log("✅ Results written to companions.json");

    await browser.close();
})();
