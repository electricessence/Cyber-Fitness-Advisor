#!/usr/bin/env node

import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let errors = 0;

function addError(message: string) {
  console.log(`❌ ERROR: ${message}`);
  errors++;
}

// Main validation
console.log('📋 Content Authoring Linter Results');

try {
  const dataDir = join(__dirname, '../src/features/assessment/data');
  const allQuestionIds = new Set<string>();
  
  // Check main question files (exclude test files)
  const questionFiles = [
    'questions.json',
    'sample-question-bank.json' // Keep this as it seems to be the main content
  ];
  
  // Also check seed content
  const seedContentPath = join(__dirname, '../src/data/seed-content/seed-content-v1.json');
  try {
    console.log('🌱 Validating Seed Content Pack v1...');
    const seedContent = JSON.parse(readFileSync(seedContentPath, 'utf-8'));
    
    if (!seedContent.contentVersion) {
      addError('Missing contentVersion in seed content');
    }
    
    const seedIds = new Set<string>();
    for (const domain of seedContent.domains || []) {
      for (const level of domain.levels || []) {
        for (const question of level.questions || []) {
          if (seedIds.has(question.id)) {
            addError(`Duplicate question ID in seed content: ${question.id}`);
          }
          seedIds.add(question.id);
          
          // Validate question structure
          if (!question.type || !['YN', 'SCALE', 'CHOICE', 'ACTION'].includes(question.type)) {
            addError(`Invalid question type in seed content: ${question.id} has type ${question.type}`);
          }
        }
      }
    }
    
    // Validate suites reference valid domains
    for (const suite of seedContent.suites || []) {
      if (!suite.unlock || !suite.unlock.gates) {
        addError(`Suite ${suite.id} missing unlock gates`);
        continue;
      }
      
      for (const gate of suite.unlock.gates) {
        for (const condition of gate.conditions || []) {
          if (!seedIds.has(condition.questionId)) {
            addError(`Suite ${suite.id} references unknown question: ${condition.questionId}`);
          }
        }
      }
    }
    
    console.log(`✅ Seed content validation complete - ${seedIds.size} questions, ${seedContent.suites?.length || 0} suites`);
    
  } catch (e: any) {
    if (e.code !== 'ENOENT') {
      addError(`Failed to parse seed content: ${e.message}`);
    }
  }
  
  for (const fileName of questionFiles) {
    try {
      const filePath = join(dataDir, fileName);
      const content = JSON.parse(readFileSync(filePath, 'utf-8'));
      
      // Validate structure based on file content
      if (content.domains && Array.isArray(content.domains)) {
        // Domain-based structure
        for (const domain of content.domains) {
          if (!domain.id) {
            addError(`Domain missing ID in ${fileName}`);
            continue;
          }
          
          for (const level of domain.levels || []) {
            for (const question of level.questions || []) {
              if (!question.id) {
                addError(`Question missing ID in ${fileName}`);
                continue;
              }
              
              if (allQuestionIds.has(question.id)) {
                addError(`Duplicate question ID across files: ${question.id}`);
              }
              allQuestionIds.add(question.id);
              
              // Validate question structure
              if (!question.text) {
                addError(`Question ${question.id} missing text in ${fileName}`);
              }
              
              if (!question.type || !['YN', 'SCALE', 'CHOICE', 'ACTION'].includes(question.type)) {
                addError(`Question ${question.id} has invalid type: ${question.type} in ${fileName}`);
              }
            }
          }
        }
      } else if (Array.isArray(content)) {
        // Array-based structure (like onboarding)
        for (const question of content) {
          if (!question.id) {
            addError(`Question missing ID in ${fileName}`);
            continue;
          }
          
          if (allQuestionIds.has(question.id)) {
            addError(`Duplicate question ID: ${question.id} in ${fileName}`);
          }
          allQuestionIds.add(question.id);
        }
      } else {
        console.log(`ℹ️  Skipping ${fileName} - unrecognized structure`);
      }
      
    } catch (e: any) {
      if (e.code !== 'ENOENT') {
        addError(`Failed to parse ${fileName}: ${e.message}`);
      }
    }
  }

} catch (error: any) {
  addError(`Failed to parse content: ${error.message}`);
}

if (errors === 0) {
  console.log('✅ All content validation checks passed!');
  process.exit(0);
} else {
  console.log(`\n❌ Found ${errors} error(s)`);
  process.exit(1);
}
