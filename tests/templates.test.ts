import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Templates } from 'src/features/templates';
import highlightFileTemplate from '../src/features/templates/highlight.file.template.handlebars?raw';
import highlightPathTemplate from '../src/features/templates/highlight.path.template.handlebars?raw';
import indexFileTemplate from '../src/features/templates/index.file.template.handlebars?raw';
import indexPathTemplate from '../src/features/templates/index.path.template.handlebars?raw';

describe('Templates', () => {
  const snapshotBaseDir = '__snapshots__';
  let snapshotBaseName: string;
  let templates: Templates;
  let compileSpy: MockInstance;
  const mockHighlight = { id: "It's the highlight id", text: "It's the highlight text" };
  const mockBook = { title: "It's the book title", author: "It's the authors name", highlights: [mockHighlight] };
  const mockData = {
    highlight: mockHighlight,
    book: mockBook,
  };

  beforeEach((expect) => {
    vi.restoreAllMocks();
    templates = new Templates();
    compileSpy = vi.spyOn(templates, 'compile');
    snapshotBaseName = `${snapshotBaseDir}/${expect.task.name} - `;
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  it('should resolve template without expressions', () => {
    const templateString = "It's a test";
    const resolvedTemplate = templates.resolve({ templateString }, {});

    expect(resolvedTemplate).toEqual("It's a test");
  });

  it('should resolve templates with simple expression', () => {
    const templateString = "It's a test with {{ data }}";
    const resolvedTemplate = templates.resolve({ templateString }, { data: 123 });

    expect(resolvedTemplate).toEqual("It's a test with 123");
  });

  it('should resolve templates with nested input object', () => {
    const templateString = "It's a test with nested {{ data.nested }}";
    const resolvedTemplate = templates.resolve({ templateString }, { data: { nested: 123 } });

    expect(resolvedTemplate).toEqual("It's a test with nested 123");
  });

  it('should resolve templates with each helper', () => {
    const templateString = "It's a test with {{#each data}}{{ this }}{{/each}}";
    const resolvedTemplate = templates.resolve({ templateString }, { data: [1, 2, 3] });

    expect(resolvedTemplate).toEqual("It's a test with 123");
  });

  it('should cache already compiled templates', () => {
    const templateString = "It's a test with {{ data }}";

    templates.resolve({ templateString }, {});
    templates.resolve({ templateString }, { data: 123 });
    templates.resolve({ templateString }, { data: 456 });

    expect(compileSpy).toHaveBeenCalledOnce();
  });

  it('should provide correct template preset for highlight file', () => {
    const resolvedTemplate = templates.resolve({ highlightFileTemplate }, mockData);
    expect(resolvedTemplate).toMatchFileSnapshot(`${snapshotBaseName}highlight file template.md`);
  });

  it('should provide correct template preset for highlight path', () => {
    const resolvedTemplate = templates.resolve({ highlightPathTemplate }, mockData);
    expect(resolvedTemplate).toMatchFileSnapshot(`${snapshotBaseName}highlight path template.md`);
  });

  it('should provide correct template preset for index file', () => {
    const resolvedTemplate = templates.resolve({ indexFileTemplate }, mockData);
    expect(resolvedTemplate).toMatchFileSnapshot(`${snapshotBaseName}index file template.md`);
  });

  it('should provide correct template preset for index path', () => {
    const resolvedTemplate = templates.resolve({ indexPathTemplate }, mockData);
    expect(resolvedTemplate).toMatchFileSnapshot(`${snapshotBaseName}index path template.md`);
  });
});
