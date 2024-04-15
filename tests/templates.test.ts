import { MockInstance, afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Templates } from 'src/features/templates';

describe('Readwise Atoms', () => {
  let templates: Templates;
  let compileSpy: MockInstance;

  beforeEach(() => {
    vi.restoreAllMocks();
    templates = new Templates();
    compileSpy = vi.spyOn(templates, 'compile');
  });

  afterAll(() => {
    vi.resetAllMocks();
  });

  describe('Templates', () => {
    it('should resolve template without expressions', () => {
      const templateString = 'test';
      const resolvedTemplate = templates.resolve({ templateString }, {});

      expect(resolvedTemplate).toEqual('test');
    });

    it('should resolve templates with simple expression', () => {
      const templateString = 'test {{ data }}';
      const resolvedTemplate = templates.resolve({ templateString }, { data: 123 });

      expect(resolvedTemplate).toEqual('test 123');
    });

    it('should resolve templates with nested input object', () => {
      const templateString = 'test {{ data.nested }}';
      const resolvedTemplate = templates.resolve({ templateString }, { data: { nested: 123 } });

      expect(resolvedTemplate).toEqual('test 123');
    });

    it('should resolve templates with each helper', () => {
      const templateString = 'test {{#each data}}{{ this }}{{/each}}';
      const resolvedTemplate = templates.resolve({ templateString }, { data: [1, 2, 3] });

      expect(resolvedTemplate).toEqual('test 123');
    });

    it('should cache already compiled templates', () => {
      const templateString = 'test {{ data }}';

      templates.resolve({ templateString }, {});
      templates.resolve({ templateString }, { data: 123 });
      templates.resolve({ templateString }, { data: 456 });

      expect(compileSpy).toHaveBeenCalledOnce();
    });
  });

  describe('Bugs', () => {
    it.todo('should add tests for bugs here');
  });
});
