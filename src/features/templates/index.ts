import * as Handlebars from 'handlebars';

export class Templates {
  templates = {} as any;

  constructor() {}

  public resolve(template: Object, data: any): string {
    const key = Object.keys(template)[0];
    if (!this.templates[key]) {
      this.templates[key] = this.compile(template);
    }
    return this.templates[key](data);
  }

  public compile(input: any) {
    return Handlebars.compile(Object.values(input)[0]);
  }
}
