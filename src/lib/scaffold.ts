export interface TemplatePreset {
  id: string;
  task_type: string;
  framework: string;
  project_name: string;
}

export interface TemplateData {
  owner: string;
  source_sha: string;
  source: string;
  hook_source: string;
  author_name: string;
  python_versions: string[];
  presets: TemplatePreset[];
  files: string[];
  prune_rules: Record<string, string[]>;
}

export interface ScaffoldOptions {
  slug: string;
  preset: string;
  serving: boolean;
  python: string;
}

export function validateSlug(slug: string): boolean {
  return /^[a-z][a-z0-9-]{1,49}$/.test(slug);
}

export function buildScaffold(data: TemplateData, options: ScaffoldOptions) {
  if (!validateSlug(options.slug)) throw new Error('Invalid project slug');
  const preset = data.presets.find((item) => item.id === options.preset);
  if (!preset || !data.python_versions.includes(options.python)) throw new Error('Invalid preset');
  const packageName = options.slug.replaceAll('-', '_');
  const projectName = options.slug.replaceAll('-', ' ');
  const removed = new Set<string>();
  if (preset.framework === 'sklearn' || preset.task_type === 'tabular') {
    for (const path of data.prune_rules.prune_for_tabular)
      removed.add(path.replaceAll('__PACKAGE__', packageName));
  } else
    for (const path of data.prune_rules.prune_for_non_tabular)
      removed.add(path.replaceAll('__PACKAGE__', packageName));
  if (!options.serving) {
    for (const path of data.prune_rules.prune_serving) {
      const resolved = path.replaceAll('__PACKAGE__', packageName);
      removed.add(resolved);
      for (const file of data.files)
        if (file.startsWith(`${path}/`)) removed.add(file.replaceAll('__PACKAGE__', packageName));
    }
  }
  const command = [
    `uvx cookiecutter gh:${data.owner}/ml-project-template`,
    `--checkout ${data.source_sha} --no-input`,
    `project_name="${projectName}" project_slug=${options.slug} package_name=${packageName}`,
    `task_type=${preset.task_type} framework=${preset.framework} has_serving=${options.serving}`,
    `python_version=${options.python} github_user=${data.owner} hf_user=${data.owner}`,
  ].join(' ');
  const files = data.files.map((path) => path.replaceAll('__PACKAGE__', packageName));
  return { command, framework: preset.framework, packageName, removed: [...removed], files };
}
