import { Injectable, Logger } from '@nestjs/common';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MailTemplateService {
  private readonly logger = new Logger(MailTemplateService.name);

  // Cache compiled templates so we don't read from disk on every email
  private compiledTemplates: Record<string, HandlebarsTemplateDelegate> = {};
  
  private getTemplatePath(template_id: string): string {
    // 1. Check relative to current __dirname (might be /dist/src/ or /src/)
    let p = path.join(__dirname, 'templates', `${template_id}.hbs`);
    if (fs.existsSync(p)) return p;

    // 2. Check nest-cli assets output folder (usually /dist/modules/mail/templates)
    p = path.join(process.cwd(), 'dist', 'modules', 'mail', 'templates', `${template_id}.hbs`);
    if (fs.existsSync(p)) return p;

    // 3. Fallback to raw /src structure
    return path.join(process.cwd(), 'src', 'modules', 'mail', 'templates', `${template_id}.hbs`);
  }

  /**
   * Translates a template_id and payload into a final HTML string.
   */
  getTemplate(template_id: string, payload: any): string {
    // If we have already compiled it, use the cached version
    if (this.compiledTemplates[template_id]) {
      return this.compiledTemplates[template_id](payload);
    }

    const templatePath = this.getTemplatePath(template_id);

    if (!fs.existsSync(templatePath)) {
      this.logger.warn(`Template file '${templatePath}' not found. Using raw text output.`);
      return `<pre>No template found for ID: ${template_id}\nPayload: ${JSON.stringify(payload, null, 2)}</pre>`;
    }

    try {
      const templateStr = fs.readFileSync(templatePath, 'utf8');
      
      // Compile template using Handlebars and cache it
      const compiled = Handlebars.compile(templateStr);
      this.compiledTemplates[template_id] = compiled;

      return compiled(payload);
    } catch (error) {
       this.logger.error(`Failed to read/compile template ${template_id}`, error);
       return `<pre>Error reading template: ${template_id}\nPayload: ${JSON.stringify(payload, null, 2)}</pre>`;
    }
  }
}
