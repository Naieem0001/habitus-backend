"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const supabaseAdmin_1 = require("../lib/supabaseAdmin");
const router = (0, express_1.Router)();
const mockUsers = [
    {
        email: 'naieem@habitus.mock',
        display_name: 'Naieem',
        xp: 340,
        level: 3,
        streak_days: 12,
        tasks_completed: 28,
        is_mock: true
    },
    {
        email: 'affan@habitus.mock',
        display_name: 'Affan',
        xp: 210,
        level: 2,
        streak_days: 8,
        tasks_completed: 19,
        is_mock: true
    },
    {
        email: 'owais@habitus.mock',
        display_name: 'Owais',
        xp: 150,
        level: 1,
        streak_days: 5,
        tasks_completed: 13,
        is_mock: true
    },
    {
        email: 'tufail@habitus.mock',
        display_name: 'Tufail',
        xp: 90,
        level: 0,
        streak_days: 3,
        tasks_completed: 7,
        is_mock: true
    }
];
router.post('/', async (req, res) => {
    try {
        const seedSecret = req.headers['x-seed-secret'];
        if (!process.env.SEED_SECRET || seedSecret !== process.env.SEED_SECRET) {
            return res.status(401).json({ error: 'Unauthorized to seed database' });
        }
        const results = [];
        for (const user of mockUsers) {
            // First, try to insert into auth.users (if needed, though for leaderboard we just need public.users)
            // Since this is a hackathon and they are mock users, we can just insert directly into public.users 
            // without creating actual auth accounts for them, depending on the RLS policies.
            // But since we are using supabaseAdmin, it bypasses RLS anyway.
            const { data, error } = await supabaseAdmin_1.supabaseAdmin
                .from('users')
                .upsert({
                ...user,
                // Generate a deterministic or random UUID for mock users
                id: crypto.randomUUID()
            }, { onConflict: 'email' })
                .select()
                .single();
            if (error) {
                console.error(`Error seeding user ${user.email}:`, error);
                results.push({ email: user.email, status: 'error', message: error.message });
            }
            else {
                results.push({ email: user.email, status: 'success', data });
            }
        }
        res.json({ message: 'Seed process completed', results });
    }
    catch (error) {
        console.error('Error in seed route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=seed.js.map