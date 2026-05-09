"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAdmin = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables');
}
// Create a Supabase client with the service role key
// CAUTION: This bypasses all Row Level Security (RLS) policies.
exports.supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
//# sourceMappingURL=supabaseAdmin.js.map