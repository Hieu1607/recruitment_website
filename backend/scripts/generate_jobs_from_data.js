'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');
const sourceFile = path.join(rootDir, 'job_data.json');
const seedersDir = path.join(rootDir, 'backend', 'src', 'seeders');
const companiesPath = path.join(seedersDir, 'companies.json');
const jobsOut = path.join(seedersDir, 'jobs.json');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const cleaned = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\n)\s*\/\/.*$/gm, '');
  return JSON.parse(cleaned);
}

function parseDateVN(dateStr) {
  // Expect formats like DD/MM/YYYY
  if (!dateStr || typeof dateStr !== 'string') return null;
  const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const [_, d, mo, y] = m;
  const dd = String(d).padStart(2, '0');
  const mm = String(mo).padStart(2, '0');
  const iso = `${y}-${mm}-${dd}`;
  // Validate real calendar date
  const date = new Date(`${iso}T00:00:00Z`);
  if (
    isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(y) ||
    date.getUTCMonth() + 1 !== Number(mm) ||
    date.getUTCDate() !== Number(dd)
  ) {
    return null;
  }
  // Fix specific invalid leap day for 2025
  if (iso === '2025-02-29') return '2025-02-28';
  return iso; // DATEONLY (YYYY-MM-DD)
}

function main() {
  const data = loadJson(sourceFile);
  const companies = loadJson(companiesPath);

  // Build name -> index map based on companies.json order
  const nameToIndex = new Map();
  companies.forEach((c, idx) => {
    if (c && c.name) nameToIndex.set(c.name.trim(), idx + 1);
  });

  const jobs = [];
  for (const entry of data) {
    const companyName = entry.ten_cong_ty || entry.companyName || entry.name || '';
    const companyId = nameToIndex.get(String(companyName).trim());
    if (!companyId) {
      // Skip jobs whose company isn't in companies.json
      continue;
    }

    const deadlineStr = entry.thoi_han_tuyen_dung || entry.deadline;
    const deadline = parseDateVN(deadlineStr);

    // Emit fields exactly matching DB schema so seeder can bulkInsert directly
    const job = {
      company_id: companyId,
      title: entry.ten_cong_viec || entry.title || '',
      level: entry.level || '',
      salary: entry.muc_luong || entry.salary || '',
      location: entry.dia_diem_lam_viec || entry.location || '',
      deadline: deadline,
      description: entry.mo_ta_cong_viec || entry.description || '',
      requirements: entry.yeu_cau_cong_viec || entry.requirements || '',
      benefits: entry.phuc_loi || entry.benefits || '',
      status: 'active',
    };

    if (job.title && job.title.trim().length > 0) {
      jobs.push(job);
    }
  }

  fs.writeFileSync(jobsOut, JSON.stringify(jobs, null, 2), 'utf8');
  console.log(`Wrote ${jobs.length} jobs to ${jobsOut}`);
}

main();
