/**
 * Tests pour le frontend SmartKnowledge
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('SmartKnowledge Frontend', () => {
  
  describe('HTML Structure', () => {
    it('index.html doit exister', () => {
      const htmlPath = path.join(__dirname, '../index.html');
      expect(fs.existsSync(htmlPath)).toBe(true);
    });
    
    it('doit avoir les balises meta requises', () => {
      const htmlPath = path.join(__dirname, '../index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      
      expect(html).toContain('<!DOCTYPE html>');
      expect(html).toContain('<html');
      expect(html).toContain('<head>');
      expect(html).toContain('<body>');
    });
    
    it('doit avoir un titre', () => {
      const htmlPath = path.join(__dirname, '../index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      expect(html).toContain('<title>');
    });
    
    it('doit avoir des sections principales', () => {
      const htmlPath = path.join(__dirname, '../index.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      // Le HTML doit avoir des sections principales
      expect(html).toContain('id="login-page"');
      expect(html).toContain('id="dashboard"');
    });
  });
  
  describe('CSS', () => {
    it('fichier CSS doit exister', () => {
      const cssPath = path.join(__dirname, '../css/style.css');
      expect(fs.existsSync(cssPath)).toBe(true);
    });
    
    it('CSS doit avoir des variables', () => {
      const cssPath = path.join(__dirname, '../css/style.css');
      const css = fs.readFileSync(cssPath, 'utf8');
      expect(css).toContain(':root');
    });
  });
  
  describe('JavaScript', () => {
    it('app.js doit exister', () => {
      const appJsPath = path.join(__dirname, '../js/app.js');
      expect(fs.existsSync(appJsPath)).toBe(true);
    });
    
    it('api.js doit exister', () => {
      const apiJsPath = path.join(__dirname, '../js/api.js');
      expect(fs.existsSync(apiJsPath)).toBe(true);
    });
  });
  
  describe('Structure des fichiers', () => {
    it('backend/src/app.py doit exister', () => {
      const appPath = path.join(__dirname, '../../backend/src/app.py');
      expect(fs.existsSync(appPath)).toBe(true);
    });
    
    it('requirements.txt doit exister', () => {
      const reqPath = path.join(__dirname, '../../backend/requirements.txt');
      expect(fs.existsSync(reqPath)).toBe(true);
    });
  });
});
