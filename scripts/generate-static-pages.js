// Generate static HTML pages for each project with OG meta tags
// This ensures Facebook/Twitter crawlers see the correct meta tags without executing JS

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateStaticPages() {
  console.log("📄 Generating static project pages...\n");

  try {
    // Read projects data
    const projectsPath = path.resolve(__dirname, "../public/data/projects.json");
    const projectsData = JSON.parse(await fs.readFile(projectsPath, "utf8"));
    const projects = projectsData.list || [];

    // Read base HTML template
    const distIndexPath = path.resolve(__dirname, "../dist/index.html");
    let baseHtml = await fs.readFile(distIndexPath, "utf8");

    let generated = 0;

    for (const project of projects) {
      if (!project.is_online) continue;
      
      const projectSlug = slugify(project.Title || "");
      if (!projectSlug) continue;

      // Get first skill for URL structure
      const skills = project._nc_m2m_sehetz_skills || [];
      if (skills.length === 0) continue;
      
      const skillName = skills[0]?.skill?.Skill || "";
      const skillSlug = slugify(skillName);
      
      // Extract description: use dedicated description field, then fall back to first text content block
      let description = "Explore this project in the Sehetz creative portfolio.";
      if (project.description) {
        const text = project.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        description = text.substring(0, 160) + (text.length > 160 ? '...' : '');
      } else if (project.content_01_text) {
        const text = project.content_01_text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        description = text.substring(0, 160) + (text.length > 160 ? '...' : '');
      }

      const title = `${project.Title} – Sehetz Sketchbook`;
      const url = `https://sehetz.ch/skills/${skillSlug}/${projectSlug}`;
      const ogImage = `https://sehetz.ch/og/${projectSlug}.jpg`;

      // Create HTML with meta tags
      let projectHtml = baseHtml;
      
      // Update title
      projectHtml = projectHtml.replace(/<title>.*?<\/title>/, `<title>${title}</title>`);
      
      // Add OG meta tags before </head>
      const metaTags = `
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:type" content="website" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    
    <!-- Twitter Card Meta Tags -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    
    <!-- Standard Meta Tags -->
    <meta name="description" content="${description}" />
    <link rel="canonical" href="${url}" />
  </head>`;
      
      projectHtml = projectHtml.replace(/<\/head>/, metaTags);

      // Create directory structure: skills/{skillSlug}/{projectSlug}/
      const outputDir = path.resolve(__dirname, `../dist/skills/${skillSlug}/${projectSlug}`);
      await fs.mkdir(outputDir, { recursive: true });
      
      const outputPath = path.join(outputDir, "index.html");
      await fs.writeFile(outputPath, projectHtml, "utf8");
      
      console.log(`✅ /skills/${skillSlug}/${projectSlug}/`);
      generated++;
    }

    console.log(`\n✨ Generated ${generated} static project pages!`);
    
    // Generate static pages for Privacy, Impressum und Sarah-Heitz
    console.log("\n📄 Generating static policy pages...\n");
    // baseHtml ist bereits oben deklariert und geladen

    // Sarah-Heitz page
    let sarahHtml = baseHtml;
    const sarahTitle = "Sarah Elena Heitz – Illustrator & Designer | Sehetz";
    const sarahDesc = "Portfolio and biography of Sarah Heitz, illustrator and designer from Basel, Switzerland.";
    sarahHtml = sarahHtml.replace(
      /<title>.*?<\/title>/,
      `<title>${sarahTitle}</title>`
    );
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Sarah Heitz",
      alternateName: ["Sarah Heitz", "Sarah", "sehetz"],
      description: "Graphic Designer with experience in Information Design, UX/UI, Design Systems, and Illustration.",
      jobTitle: ["Information Designer", "Illustrator", "Frontend Developer"],
      url: "https://sehetz.ch",
      email: "hoi@sehetz.ch",
      image: "https://sehetz.ch/media/Sehetz-Team-Hochschule-Trier-3.jpg",

      birthDate: "1995-10-10",
      gender: "female",
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "Hochschule Trier",
        url: "https://www.hochschule-trier.de/"
      },
      nationality: "German",
      hasCredential: [
        {
          "@type": "EducationalOccupationalCredential",
          credentialCategory: "Bachelor of Arts",
          educationalLevel: "University"
        }
      ],
      memberOf: [
        // {
        //   "@type": "Organization",
        //   name: "Swiss Graphic Designers Association"
        // }
      ],
      knowsLanguage: ["de", "en"],
      address: {
        "@type": "PostalAddress",
        addressLocality: "Basel",
        addressCountry: "CH"
      },
      sameAs: [
        "https://www.linkedin.com/in/sarah-heitz-7b722b118/",
        "https://www.instagram.com/sehetz/",
        "https://www.behance.net/sehetz",
        "https://ch.pinterest.com/sehetzch/"
      ],
      knowsAbout: [
        "Product Design",
        "UX Design",
        "UI Design",
        "Design Systems",
        "Illustration",
        "Frontend Development",
        "Comic",
      ],
      worksFor: [
        {
          "@type": "Organization",
          name: "Superdot.studio",
          url: "https://superdot.studio",
          description: "Agency for Information Design"
        },
        {
          "@type": "Organization",
          name: "Carnault.ch",
          url: "https://carnault.ch",
          description: "Luxury Brand for electric Cigarettes"
        }
      ],
      hasOccupation: [
        {
          "@type": "Occupation",
          name: "Designer"
        },
        {
          "@type": "Occupation",
          name: "Illustrator"
        },
        {
          "@type": "Occupation",
          name: "Developer"
        }
      ]
    };
    sarahHtml = sarahHtml.replace(
      /<\/head>/,
      `    <meta name=\"description\" content=\"${sarahDesc}\" />
    <link rel=\"canonical\" href=\"https://sehetz.ch/sarah-heitz\" />
    <meta property=\"og:title\" content=\"${sarahTitle}\" />
    <meta property=\"og:description\" content=\"${sarahDesc}\" />
    <meta property=\"og:url\" content=\"https://sehetz.ch/sarah-heitz\" />
    <meta property=\"og:type\" content=\"profile\" />
    <script type=\"application/ld+json\">${JSON.stringify(personSchema)}</script>
  </head>`
    );
    const sarahDir = path.resolve(__dirname, "../dist/sarah-heitz");
    await fs.mkdir(sarahDir, { recursive: true });
    await fs.writeFile(path.join(sarahDir, "index.html"), sarahHtml, "utf8");
    console.log(`✅ /sarah-heitz/`);

    // Privacy page
    let privacyHtml = baseHtml;
    const privacyDesc = "Privacy Policy for Sehetz – Information about how personal data is collected, used, and protected on this website.";
    privacyHtml = privacyHtml.replace(
      /<title>.*?<\/title>/,
      `<title>Privacy Policy – Sehetz</title>`
    );
    privacyHtml = privacyHtml.replace(
      /<\/head>/,
      `    <meta name="description" content="${privacyDesc}" />
    <link rel="canonical" href="https://sehetz.ch/privacy" />
    <meta property="og:title" content="Privacy Policy – Sehetz" />
    <meta property="og:description" content="${privacyDesc}" />
    <meta property="og:url" content="https://sehetz.ch/privacy" />
    <meta property="og:type" content="website" />
  </head>`
    );
    const privacyDir = path.resolve(__dirname, "../dist/privacy");
    await fs.mkdir(privacyDir, { recursive: true });
    await fs.writeFile(path.join(privacyDir, "index.html"), privacyHtml, "utf8");
    console.log(`✅ /privacy/`);
    
    // Impressum page
    let impressumHtml = baseHtml;
    const impressumDesc = "Impressum for Sehetz – Legal information and imprint for this website by Sarah Heitz.";
    impressumHtml = impressumHtml.replace(
      /<title>.*?<\/title>/,
      `<title>Impressum – Sehetz</title>`
    );
    impressumHtml = impressumHtml.replace(
      /<\/head>/,
      `    <meta name="description" content="${impressumDesc}" />
    <link rel="canonical" href="https://sehetz.ch/impressum" />
    <meta property="og:title" content="Impressum – Sehetz" />
    <meta property="og:description" content="${impressumDesc}" />
    <meta property="og:url" content="https://sehetz.ch/impressum" />
    <meta property="og:type" content="website" />
  </head>`
    );
    const impressumDir = path.resolve(__dirname, "../dist/impressum");
    await fs.mkdir(impressumDir, { recursive: true });
    await fs.writeFile(path.join(impressumDir, "index.html"), impressumHtml, "utf8");
    console.log(`✅ /impressum/`);

    // Mission Iris page
    let missionIrisHtml = baseHtml;
    const missionIrisTitle = "Mission Iris – Sehetz Webcomic";
    const missionIrisDesc = "Mission Iris – a webcomic by Sarah Heitz. Explore the story.";
    const missionIrisOgImage = "https://sehetz.ch/og/mission-iris-og-image.webp";
    missionIrisHtml = missionIrisHtml.replace(
      /<title>.*?<\/title>/,
      `<title>${missionIrisTitle}</title>`
    );
    missionIrisHtml = missionIrisHtml.replace(
      /<\/head>/,
      `    <meta name="description" content="${missionIrisDesc}" />
    <link rel="canonical" href="https://sehetz.ch/mission-iris" />
    <meta property="og:title" content="${missionIrisTitle}" />
    <meta property="og:description" content="${missionIrisDesc}" />
    <meta property="og:url" content="https://sehetz.ch/mission-iris" />
    <meta property="og:type" content="website" />
    <meta property="og:image" content="${missionIrisOgImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${missionIrisTitle}" />
    <meta name="twitter:description" content="${missionIrisDesc}" />
    <meta name="twitter:image" content="${missionIrisOgImage}" />
  </head>`
    );
    const missionIrisDir = path.resolve(__dirname, "../dist/mission-iris");
    await fs.mkdir(missionIrisDir, { recursive: true });
    await fs.writeFile(path.join(missionIrisDir, "index.html"), missionIrisHtml, "utf8");
    console.log(`✅ /mission-iris/`);
    
    console.log(`\n✨ Generated static policy pages!`);

    // ────────────────────────────────────────────────────────────
    // Generate static pages for GEARS
    // ────────────────────────────────────────────────────────────
    console.log("\n📄 Generating static gear pages...\n");

    const gearsMap = new Map();
    for (const proj of projects) {
      if (!proj.is_online) continue;
      for (const g of (proj._nc_m2m_sehetz_gears || [])) {
        if (g.gear && g.gear.Gear) gearsMap.set(g.gear.Gear, g.gear);
      }
    }

    for (const [gearName, gear] of gearsMap) {
      const gearSlug = slugify(gearName);
      if (!gearSlug) continue;

      const gearTitle = `${gearName} – Sehetz Creative Tools`;
      let gearDesc = `${gearName} is one of the creative tools used by Sarah Heitz in her illustration and design projects.`;
      if (gear.description) {
        const cleaned = gear.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        gearDesc = cleaned.substring(0, 160) + (cleaned.length > 160 ? '...' : '');
      }
      const gearUrl = `https://sehetz.ch/gears/${gearSlug}`;

      let gearHtml = baseHtml;
      gearHtml = gearHtml.replace(/<title>.*?<\/title>/, `<title>${gearTitle}</title>`);
      gearHtml = gearHtml.replace(
        /<\/head>/,
        `    <meta name="description" content="${gearDesc.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="${gearUrl}" />
    <meta property="og:title" content="${gearTitle}" />
    <meta property="og:description" content="${gearDesc.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${gearUrl}" />
    <meta property="og:type" content="website" />
  </head>`
      );

      const gearDir = path.resolve(__dirname, `../dist/gears/${gearSlug}`);
      await fs.mkdir(gearDir, { recursive: true });
      await fs.writeFile(path.join(gearDir, "index.html"), gearHtml, "utf8");
      console.log(`✅ /gears/${gearSlug}/`);
    }

    // ────────────────────────────────────────────────────────────
    // Generate static pages for TEAMS
    // ────────────────────────────────────────────────────────────
    console.log("\n📄 Generating static team pages...\n");

    const teamsMap = new Map();
    for (const proj of projects) {
      if (!proj.is_online) continue;
      for (const t of (proj._nc_m2m_sehetz_teams || [])) {
        if (t.team && t.team.Team) teamsMap.set(t.team.Team, t.team);
      }
    }

    for (const [teamName, team] of teamsMap) {
      const teamSlug = slugify(teamName);
      if (!teamSlug) continue;

      const teamTitle = `${teamName} – Sehetz Team`;
      let teamDesc = `Projects and work done by Sarah Heitz together with ${teamName}.`;
      if (team.description) {
        const cleaned = team.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
        teamDesc = cleaned.substring(0, 160) + (cleaned.length > 160 ? '...' : '');
      } else if (team.role && team.location) {
        teamDesc = `Sarah Heitz worked as ${team.role} at ${teamName} in ${team.location}.`;
      }
      const teamUrl = `https://sehetz.ch/teams/${teamSlug}`;

      let teamHtml = baseHtml;
      teamHtml = teamHtml.replace(/<title>.*?<\/title>/, `<title>${teamTitle}</title>`);
      teamHtml = teamHtml.replace(
        /<\/head>/,
        `    <meta name="description" content="${teamDesc.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="${teamUrl}" />
    <meta property="og:title" content="${teamTitle}" />
    <meta property="og:description" content="${teamDesc.replace(/"/g, '&quot;')}" />
    <meta property="og:url" content="${teamUrl}" />
    <meta property="og:type" content="website" />
  </head>`
      );

      const teamDir = path.resolve(__dirname, `../dist/teams/${teamSlug}`);
      await fs.mkdir(teamDir, { recursive: true });
      await fs.writeFile(path.join(teamDir, "index.html"), teamHtml, "utf8");
      console.log(`✅ /teams/${teamSlug}/`);
    }

    console.log(`\n✨ Generated static gear and team pages!`);
  } catch (err) {
    console.error("❌ Error generating static pages:", err.message);
    process.exit(1);
  }
}

generateStaticPages();
