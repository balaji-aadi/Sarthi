import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config({ path: './.env' });

const COMPANY_SEED_LIST = [
  { name: "Google", slug: "google" },
  { name: "Meta", slug: "meta" },
  { name: "Microsoft", slug: "microsoft" },
  { name: "Netflix", slug: "netflix" },
  { name: "Amazon", slug: "amazon" },
  { name: "Apple", slug: "apple" },
  { name: "LinkedIn", slug: "linkedin" },
  { name: "Atlassian", slug: "atlassian" },
  { name: "Uber", slug: "uber" },
  { name: "D.E. Shaw", slug: "de-shaw" },
  { name: "Bloomberg", slug: "bloomberg" },
  { name: "Tower Research Capital", slug: "tower-research-capital" },
  { name: "Stripe", slug: "stripe" },
  { name: "PayPal", slug: "paypal" },
  { name: "Salesforce", slug: "salesforce" },
  { name: "Adobe", slug: "adobe" },
  { name: "Flipkart", slug: "flipkart" },
  { name: "PhonePe", slug: "phonepe" },
  { name: "Meesho", slug: "meesho" },
  { name: "CRED", slug: "cred" },
  { name: "Razorpay", slug: "razorpay" },
  { name: "Zomato", slug: "zomato" },
  { name: "Swiggy", slug: "swiggy" },
  { name: "Zepto", slug: "zepto" },
  { name: "Paytm", slug: "paytm" },
  { name: "ServiceNow", slug: "servicenow" },
  { name: "Intuit", slug: "intuit" },
  { name: "Walmart", slug: "walmart" },
  { name: "Goldman Sachs", slug: "goldman-sachs" },
  { name: "J.P. Morgan Chase", slug: "jp-morgan-chase" },
  { name: "Morgan Stanley", slug: "morgan-stanley" },
  { name: "Oracle", slug: "oracle" },
  { name: "Cisco", slug: "cisco" },
  { name: "Visa", slug: "visa" },
  { name: "Mastercard", slug: "mastercard" },
  { name: "Barclays", slug: "barclays" },
  { name: "HSBC", slug: "hsbc" },
  { name: "Accenture", slug: "accenture" },
  { name: "TCS + TCS NQT", slug: "tcs" },
  { name: "Infosys", slug: "infosys" },
  { name: "Cognizant", slug: "cognizant" },
  { name: "Wipro", slug: "wipro" },
  { name: "HCLTech", slug: "hcltech" },
  { name: "Tech Mahindra", slug: "tech-mahindra" },
  { name: "Capgemini", slug: "capgemini" },
  { name: "Airbnb", slug: "airbnb" },
  { name: "ByteDance", slug: "bytedance" },
  { name: "Samsung", slug: "samsung" }
];

async function seedCompanies() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const Company = mongoose.model(
      "Company",
      new mongoose.Schema(
        {
          name: { type: String, required: true },
          slug: { type: String, required: true, unique: true },
          logoUrl: { type: String, default: "" }
        },
        { timestamps: true }
      )
    );

    let createdCount = 0;
    let existingCount = 0;

    for (const comp of COMPANY_SEED_LIST) {
      const existing = await Company.findOne({
        $or: [
          { slug: comp.slug },
          { name: comp.name }
        ]
      });

      if (!existing) {
        await Company.create({
          name: comp.name,
          slug: comp.slug,
          logoUrl: ""
        });
        createdCount++;
        console.log(`+ Created company: ${comp.name} (${comp.slug})`);
      } else {
        existingCount++;
      }
    }

    const totalInDb = await Company.countDocuments();
    console.log(`\nSeeding completed successfully!`);
    console.log(`Newly created: ${createdCount}`);
    console.log(`Already existed: ${existingCount}`);
    console.log(`Total companies in DB: ${totalInDb}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seedCompanies();
