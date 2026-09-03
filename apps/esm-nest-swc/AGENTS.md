# 构建配置

`project.json` 中的 `build` target 有意使用 `nx:run-commands`，同时运行：

- `nest build`：负责构建应用。
- `nx run esm-nest-swc:typecheck --batch`：独立执行类型检查，以利用 Nx 对 `typecheck` 任务的缓存和批处理能力，提高重复检查的效率。

这不是遗漏类型检查，也不是配置错误。不要将其改为由 `nest build` 同时执行类型检查（例如 `nest build --type-check`）；应保留独立的 Nx `typecheck --batch` 任务。
