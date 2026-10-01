import * as fs from "node:fs";
import * as path from "node:path";

function loadEnv(file: string) {
  const fullPath = path.resolve(process.cwd(), file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

loadEnv(".env.local");
loadEnv(".env");

async function main() {
  const { auth } = await import("../lib/auth");
  const { networkDb, generateId } = await import("../modules/network/lib/network-db");

  const email = process.env.DEMO_USER_EMAIL || "dr.rohan@mgn.life";
  const password = process.env.DEMO_USER_PASSWORD || "Doctor2026@";
  const name = "Dr. Rohan Malhotra, MD";

  console.log(`Creating / Updating Demo Clinician profile for: ${email}...`);

  let userId: string | null = null;

  // 1. Check if user already exists
  const existingUser = await networkDb
    .selectFrom("user")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();

  if (existingUser) {
    userId = existingUser.id;
    console.log(`User exists with ID: ${userId}`);

    // Update name and emailVerified
    await networkDb
      .updateTable("user")
      .set({
        name,
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where("id", "=", userId)
      .execute();
  } else {
    // 2. Create user with better auth
    try {
      const res = await auth.api.signUpEmail({
        body: {
          email,
          password,
          name,
        },
      });

      if (res?.user?.id) {
        userId = res.user.id;
        console.log(`User registered successfully with ID: ${userId}`);
      }
    } catch (err: any) {
      console.warn("Sign up returned:", err?.message || err);
    }

    if (!userId) {
      const fetched = await networkDb
        .selectFrom("user")
        .selectAll()
        .where("email", "=", email)
        .executeTakeFirst();
      userId = fetched?.id || null;
    }
  }

  if (!userId) {
    console.error("Failed to obtain userId for demo account.");
    process.exit(1);
  }

  // Ensure emailVerified
  await networkDb
    .updateTable("user")
    .set({ emailVerified: true })
    .where("id", "=", userId)
    .execute();

  const now = new Date();

  // 3. Upsert into professional_profiles
  const existingProf = await networkDb
    .selectFrom("professional_profiles")
    .selectAll()
    .where("user_id", "=", userId)
    .executeTakeFirst();

  if (existingProf) {
    await networkDb
      .updateTable("professional_profiles")
      .set({
        username: "dr_rohan_malhotra",
        member_id: "MGN-DOC-0042",
        profession: "Doctor / Physician",
        specialization: "Cardiology",
        sub_specialization: "Interventional Cardiology",
        designation: "Senior Interventional Cardiologist",
        organization: "Apollo Hospitals",
        primary_degree: "MBBS, MD (Medicine), DM (Cardiology)",
        additional_degrees: ["FACC", "FSCAI"],
        medical_council: "National Medical Commission (NMC)",
        registration_number: "NMC-2012-08492",
        city: "Indore",
        state: "Madhya Pradesh",
        country: "India",
        experience_years: 12,
        bio: "Senior Interventional Cardiologist with 12+ years of clinical excellence in complex coronary interventions, structural heart disease, transcatheter aortic valve replacement (TAVR), and clinical cardiovascular research.",
        skills: [
          "Interventional Cardiology",
          "Coronary Angioplasty",
          "Echocardiography",
          "Cardiac Emergency",
          "Clinical Trials",
        ],
        languages: ["English", "Hindi"],
        identity_verified: true,
        education_verified: true,
        registration_verified: true,
        experience_verified: true,
        profile_visibility: "public",
        updated_at: now,
      })
      .where("user_id", "=", userId)
      .execute();
    console.log("Updated professional profile.");
  } else {
    await networkDb
      .insertInto("professional_profiles")
      .values({
        id: generateId(),
        user_id: userId,
        username: "dr_rohan_malhotra",
        member_id: "MGN-DOC-0042",
        is_founding_member: false,
        membership_tier: "MEMBER",
        profession: "Doctor / Physician",
        specialization: "Cardiology",
        sub_specialization: "Interventional Cardiology",
        designation: "Senior Interventional Cardiologist",
        organization: "Apollo Hospitals",
        primary_degree: "MBBS, MD (Medicine), DM (Cardiology)",
        additional_degrees: ["FACC", "FSCAI"],
        medical_council: "National Medical Commission (NMC)",
        registration_number: "NMC-2012-08492",
        city: "Indore",
        state: "Madhya Pradesh",
        country: "India",
        experience_years: 12,
        bio: "Senior Interventional Cardiologist with 12+ years of clinical excellence in complex coronary interventions, structural heart disease, transcatheter aortic valve replacement (TAVR), and clinical cardiovascular research.",
        skills: [
          "Interventional Cardiology",
          "Coronary Angioplasty",
          "Echocardiography",
          "Cardiac Emergency",
          "Clinical Trials",
        ],
        languages: ["English", "Hindi"],
        identity_verified: true,
        education_verified: true,
        registration_verified: true,
        experience_verified: true,
        profile_visibility: "public",
        created_at: now,
        updated_at: now,
      })
      .execute();
    console.log("Created professional profile.");
  }

  // 4. Upsert into mgn_identities
  try {
    const existingIdentity = await networkDb
      .selectFrom("mgn_identities" as any)
      .selectAll()
      .where("user_id" as any, "=", userId)
      .executeTakeFirst();

    if (existingIdentity) {
      await networkDb
        .updateTable("mgn_identities" as any)
        .set({
          display_name: "Dr. Rohan Malhotra, MD",
          category: "CLINICAL_PRACTITIONER",
          profession_or_type: "Doctor / Physician",
          specialization: "Cardiology",
          current_organization: "Apollo Hospitals",
          city: "Indore",
          state: "Madhya Pradesh",
          country: "India",
          verification_status: "VERIFIED",
          updated_at: now,
        })
        .where("user_id" as any, "=", userId)
        .execute();
    } else {
      await networkDb
        .insertInto("mgn_identities" as any)
        .values({
          id: generateId(),
          user_id: userId,
          account_type: "INDIVIDUAL",
          category: "CLINICAL_PRACTITIONER",
          profession_or_type: "Doctor / Physician",
          display_name: "Dr. Rohan Malhotra, MD",
          specialization: "Cardiology",
          current_organization: "Apollo Hospitals",
          city: "Indore",
          state: "Madhya Pradesh",
          country: "India",
          verification_status: "VERIFIED",
          created_at: now,
          updated_at: now,
        })
        .execute();
    }
    console.log("Updated mgn_identities.");
  } catch (err) {
    console.warn("mgn_identities upsert note:", err);
  }

  console.log("\n==========================================");
  console.log("DEMO PROFILE GENERATED SUCCESSFULLY!");
  console.log("==========================================");
  console.log("Email:      dr.rohan@mgn.life");
  console.log("Password:   Doctor2026@");
  console.log("Name:       Dr. Rohan Malhotra, MD");
  console.log("Profession: Doctor / Physician (Cardiology)");
  console.log("Member ID:  MGN-DOC-0042");
  console.log("Admin URL:  /admin/users (Inspect, Edit ID, Toggle Verification, Assign Roles)");
  console.log("==========================================\n");

  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating demo profile:", err);
  process.exit(1);
});
