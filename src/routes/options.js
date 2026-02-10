import express from "express";
import SystemOption from "../models/SystemOption.js";

const router = express.Router();

// Get all options grouped by category
router.get("/all", async (req, res) => {
    try {
        const options = await SystemOption.find({});

        // Group by category
        const grouped = {
            department: [],
            designation: [],
            workType: []
        };

        options.forEach(opt => {
            if (grouped[opt.category]) {
                grouped[opt.category].push({ value: opt.value, label: opt.value });
            }
        });

        // If empty, seed default values (optional, but good for first run)
        if (options.length === 0) {
            const defaults = [
                // Departments (UI Department -> DB User.role)
                { category: "department", value: "SM Developer" },
                { category: "department", value: "SM SEO Specialist" },
                { category: "department", value: "SM Designer" },
                { category: "department", value: "Website Developer" },
                { category: "department", value: "Full Stack Developer" },
                { category: "department", value: "Sales Team" },

                // Designations (UI Role -> DB User.designation)
                { category: "designation", value: "Junior" },
                { category: "designation", value: "Senior" },
                { category: "designation", value: "Tech Lead" },
                { category: "designation", value: "Intern" },

                // Work Types
                { category: "workType", value: "Full Time" },
                { category: "workType", value: "Hybrid" },
                { category: "workType", value: "Remote" },
            ];

            await SystemOption.insertMany(defaults);

            // Re-populate grouped after seeding
            defaults.forEach(opt => {
                if (grouped[opt.category]) {
                    grouped[opt.category].push({ value: opt.value, label: opt.value });
                }
            });
        }

        res.json(grouped);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Add a new option
router.post("/add", async (req, res) => {
    try {
        const { category, value } = req.body;

        if (!category || !value) {
            return res.status(400).json({ message: "Category and Value are required" });
        }

        const existing = await SystemOption.findOne({ category, value });
        if (existing) {
            return res.status(400).json({ message: "Option already exists" });
        }

        const newOption = await SystemOption.create({ category, value });

        res.status(201).json({
            message: "Option added successfully",
            option: { value: newOption.value, label: newOption.value, category: newOption.category }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
