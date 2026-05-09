"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verifyToken_1 = require("../middleware/verifyToken");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const router = (0, express_1.Router)();
// Get current user profile from public.users table
router.get('/me', verifyToken_1.verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { data, error } = await supabaseAdmin_1.supabaseAdmin
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (error) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map