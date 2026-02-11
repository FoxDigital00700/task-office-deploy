import SystemOption from "../models/SystemOption.js";
import WorkLog from "../models/WorkLog.js";

// @desc    Get All Options (Global + User Specific + Legacy from WorkLogs)
// @route   GET /api/system-options
// @access  Private
export const getOptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const { category } = req.query; // optional filter

        const query = {
            $or: [
                { createdBy: null }, // Global
                { createdBy: userId } // User's own
            ]
        };

        if (category) {
            query.category = category;
        }

        const systemOptions = await SystemOption.find(query).sort({ value: 1 });

        // Also fetch from WorkLogs for legacy support (aggregated)
        // We only want unique string values that are NOT in systemOptions
        // Let's fetch distinct values and merge.
        let legacyValues = [];
        if (category === 'Project') {
            legacyValues = await WorkLog.distinct("projectName", { employeeId: userId });
        } else if (category === 'Owner') {
            legacyValues = await WorkLog.distinct("taskOwner"); // Owners are global usually?
        } else if (category === 'Type') {
            legacyValues = await WorkLog.distinct("taskType");
        }

        // Map system options
        const formattedOptions = systemOptions.map(opt => ({
            _id: opt._id,
            value: opt.value,
            category: opt.category,
            isCustom: !!opt.createdBy, // True if created by user
            canDelete: !!opt.createdBy // User can only delete their own
        }));

        // Add legacy (string only) if not present
        const systemValuesInfo = new Set(formattedOptions.map(o => o.value));

        legacyValues.forEach(val => {
            if (val && !systemValuesInfo.has(val)) {
                formattedOptions.push({
                    _id: null,
                    value: val,
                    category, // might be undefined if not filtered
                    isCustom: false,
                    canDelete: false
                });
            }
        });

        res.json(formattedOptions);
    } catch (error) {
        console.error("Error fetching options:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Add New Option
// @route   POST /api/system-options
// @access  Private
export const addOption = async (req, res) => {
    try {
        const { category, value } = req.body;
        const userId = req.user.id;

        if (!category || !value) {
            return res.status(400).json({ message: "Category and Value are required" });
        }

        // Check availability (global or own)
        const existing = await SystemOption.findOne({
            category,
            value,
            $or: [{ createdBy: null }, { createdBy: userId }]
        });

        if (existing) {
            return res.status(400).json({ message: "Option already exists" });
        }

        const newOption = await SystemOption.create({
            category,
            value,
            createdBy: userId
        });

        res.status(201).json({
            _id: newOption._id,
            value: newOption.value,
            category: newOption.category,
            isCustom: true,
            canDelete: true
        });

    } catch (error) {
        console.error("Error adding option:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

// @desc    Delete Option
// @route   DELETE /api/system-options/:id
// @access  Private
export const deleteOption = async (req, res) => {
    try {
        const option = await SystemOption.findById(req.params.id);

        if (!option) {
            return res.status(404).json({ message: "Option not found" });
        }

        if (!option.createdBy || option.createdBy.toString() !== req.user.id.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this option" });
        }

        await option.deleteOne();

        res.json({ message: "Option removed" });
    } catch (error) {
        console.error("Error deleting option:", error);
        res.status(500).json({ message: "Server Error" });
    }
};
