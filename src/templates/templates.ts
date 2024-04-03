import * as Handlebars from 'handlebars';

export default class Templates {
  templates = {} as any;

  public resolve(template: Object, data: any): string {
    const key = Object.keys(template)[0];
    if (!this.templates[key]) {
      this.templates[key] = Handlebars.compile(Object.values(template)[0]);
    }
    return this.templates[key](data);
  }
}
