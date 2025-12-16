'use strict';

const fs = require('fs');
const path = require('path');

// Paths
const rootDir = path.resolve(__dirname, '..', '..');
const sourceFile = path.join(rootDir, 'job_data.json');
const seedersDir = path.join(rootDir, 'backend', 'src', 'seeders');
const companiesOut = path.join(seedersDir, 'companies.json');
const jobsOut = path.join(seedersDir, 'jobs.json');

function loadJson(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  // Remove JS-style comments if present
  const cleaned = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|\n)\s*\/\/.*$/gm, '');
  return JSON.parse(cleaned);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

function toCompany(entry) {
  // Map flexible fields from job_data.json to seeder `companies` schema
  return {
    name: entry.ten_cong_ty || entry.companyName || entry.name || '',
    description: entry.mo_ta || entry.description || '',
    size: entry.quy_mo || entry.size || '',
    type: entry.loai_hinh_hoat_dong || entry.type || '',
    address: entry.dia_chi || entry.address || '',
    website: entry.website || '',
    phone: entry.dien_thoai || entry.phone || '',
    email: entry.email || '',
  };
}

function toJob(entry, companyId) {
  // Basic mapping to jobs schema with company_id and DATEONLY strings
  const rawDeadline = entry.thoi_han_tuyen_dung || entry.deadline || entry.deadlineDays;
  let deadline = null;
  if (typeof rawDeadline === 'string') {
    // Try DD/MM/YYYY
    const m = rawDeadline.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const [_, d, mo, y] = m;
      const dd = String(d).padStart(2, '0');
      const mm = String(mo).padStart(2, '0');
      const iso = `${y}-${mm}-${dd}`;
      const date = new Date(`${iso}T00:00:00Z`);
      if (
        !isNaN(date.getTime()) &&
        date.getUTCFullYear() === Number(y) &&
        date.getUTCMonth() + 1 === Number(mm) &&
        date.getUTCDate() === Number(dd)
      ) {
        deadline = iso === '2025-02-29' ? '2025-02-28' : iso;
      }
    }
  }

  return {
    company_id: companyId,
    title: entry.ten_cong_viec || entry.tieu_de || entry.jobTitle || entry.title || '',
    level: entry.level || entry.cap_do || '',
    salary: entry.muc_luong || entry.salary || '',
    location: entry.dia_diem_lam_viec || entry.dia_diem || entry.location || '',
    deadline,
    description: entry.mo_ta_cong_viec || entry.jobDescription || entry.description || '',
    requirements: entry.yeu_cau_cong_viec || entry.yeu_cau || entry.requirements || '',
    benefits: entry.phuc_loi || entry.benefits || '',
    status: entry.status || 'active',
  };
}

function main() {
  console.log('Reading source job_data.json...');
  const data = loadJson(sourceFile);
  if (!Array.isArray(data)) {
    throw new Error('job_data.json must be an array of entries');
  }

  ensureDir(seedersDir);

  const companies = [];
  const jobs = [];

  let companyIndex = 0;
  for (const entry of data) {
    const company = toCompany(entry);
    if (company.name && company.name.trim().length > 0) {
      companies.push(company);
      companyIndex += 1;
    } else {
      // Skip entries without a company name
      continue;
    }

    const job = toJob(entry, companyIndex);
    if (job.title && job.title.trim().length > 0) {
      jobs.push(job);
    }
  }

  console.log(`Extracted companies: ${companies.length}, jobs: ${jobs.length}`);
  writeJson(companiesOut, companies);
  writeJson(jobsOut, jobs);
  console.log('Wrote:', companiesOut);
  console.log('Wrote:', jobsOut);
}

main();
