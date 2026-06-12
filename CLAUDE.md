# CLAUDE.md

本文件为 Claude Code（claude.ai/code）在本仓库中工作提供指导。

## 0. 执行规则

### 0.1 修改前必须做

1. 先判断任务类型：Nest 应用逻辑、共享库、Nx 目标、构建配置、测试配置、ESM / TypeScript 配置、依赖或脚本。
2. 按第 1 节找到优先入口文件，不要一开始全仓库扫读。
3. 判断是否命中第 3 节高风险文件或第 4 节联动修改规则。
4. 命中高风险文件时，默认按影响面较大的改动处理，先明确会影响哪些项目和目标。
5. 需要本地运行或复现时，先确认目标项目、端口、环境变量、构建栈是 `ts-jest` 还是 `swc`，以及是否需要同时验证另一个并行 Nest 应用。

### 0.2 修改中必须做

1. 优先复用现有实现，不新增平行方案。
2. 修改范围最小化，不做无关重构或顺手优化。
3. 不为了“更优雅”提前新增抽象；只有确认会复用时再抽取。
4. 不无故删除已有注释；如果注释错误、过期或表达不清，优先修正。
5. 修改含中文的文件时，确保 UTF-8 中文不乱码。
6. 涉及高风险文件时，在最终说明中明确影响范围。
7. 相对 TypeScript 导入保持现有 NodeNext ESM 写法，继续使用显式 `.js` 后缀。

### 0.3 修改后必须做

1. 按第 6 节完成必要验证；无法验证时说明原因。
2. 对照第 4 节检查是否遗漏联动点。
3. 如果引入新约定、修复高频坑或改变关键行为，更新 `CLAUDE.md`、相关 README，或与代码强绑定的旁路说明文档。
4. 未经用户明确要求，不执行 `git add`、提交、改写提交或推送。

## 1. 任务分类与优先入口

通用入口按需阅读：`package.json`、`nx.json`、`pnpm-workspace.yaml`、`tsconfig.base.json`、根 `eslint.config.mjs`、根 `jest.config.ts`。只需要局部上下文时，不要通读全仓库。

| 任务类型 | 优先入口 |
| --- | --- |
| Nest 应用逻辑 | `apps/<app>/src/main.ts`、`apps/<app>/src/app/app.module.ts`、对应 controller / service / validator |
| 构建问题 | 对应 `project.json`、`tsconfig*.json`、`nest-cli.json`、`.swcrc`、`nx.json` |
| 测试问题 | 对应 `jest.config.*`、`tsconfig.spec.json`、目标项目的 `*.spec.ts` |
| 共享库 API | `libs/<lib>/src/index.ts`、`libs/<lib>/src/lib/*`、`libs/<lib>/package.json` |
| ESM / 导入解析 | `tsconfig.base.json`、项目 `package.json` 的 `exports`、相对导入的 `.js` 后缀 |
| Nx 目标或缓存 | `nx.json`、项目 `project.json`、`pnpm exec nx show project <name> --json` |
| 依赖或脚本 | 根 `package.json`、目标包 `package.json`、`pnpm-workspace.yaml`、`pnpm-lock.yaml` |
| lint 规则 | 根 `eslint.config.mjs`、项目 `eslint.config.mjs` |

## 2. 架构概览

这是一个 Nx 22、pnpm、ESM TypeScript 和 NestJS 工作区。工作区包位于 `apps/**` 和 `libs/**` 下，实际 Nx 项目如下：

- `esm-nest-jest`：位于 `apps/esm-nest-jest` 的 Nest 应用。
- `esm-nest-swc`：位于 `apps/esm-nest-swc` 的并行 Nest 应用。
- `@nx-learn/common`：位于 `libs/common` 的共享库。
- `@nx-learn/test`：位于 `libs/test` 的共享测试或演示库。

根 README 基本仍是 Nx 生成的起始文档，并且示例项目名仍写成 `api`。实际运行命令时使用上面列出的项目名。

两个应用的 Nest 源码结构基本一致：`src/main.ts` 启动 `AppModule`，把全局前缀设为 `/api`，并监听 `process.env.PORT || 3000`；`AppModule` 导入 `ScheduleModule.forRoot()`，注册 `AppController`、`AppService` 和 `CronService`；控制器从 `@nx-learn/common` 导入 `CommonCls`，运行一个 `class-validator` 示例后返回 `AppService.getData()`。

两个应用的构建和测试栈不同：

- `esm-nest-jest` 使用 Nx 和 TypeScript 推断出的构建目标，也就是 `tsc --build tsconfig.lib.json`；Jest 使用 ESM 模式的 `ts-jest`，测试目标设置了 `NODE_OPTIONS=--no-experimental-strip-types --experimental-vm-modules`。
- `esm-nest-swc` 在 `project.json` 中覆盖了 `build`，先通过 `nest build` 使用 SWC 构建（配置在 `nest-cli.json` 和 `.swcrc`），再执行 `esm-nest-swc:typecheck`；它的 Jest 配置使用 `@swc/jest`。

库依赖方向是 `apps -> @nx-learn/common -> @nx-learn/test`：两个应用实例化 `CommonCls`；`CommonCls.debug()` 调用 `@nx-learn/test` 中的 `common()`。因为 Nx 的测试目标依赖 `^test`，所以测试任一应用时会先运行依赖项目的测试。

本仓库使用 NodeNext ESM 包导出，而不是 TypeScript `paths`。`tsconfig.base.json` 将 `moduleResolution` 和 `module` 设为 `nodeNext`，并启用 `@nx-learn/source` 自定义条件。内部库的 `package.json` 会把 `@nx-learn/source` 指向 `./src/index.ts`，普通导入指向 `./dist/index.js`。相对 TypeScript 导入要保留显式 `.js` 后缀，与现有源码保持一致。

Nx 目标主要由 `nx.json` 中配置的插件推断，包括 `@nx/js/typescript`、`@nx/eslint/plugin` 和 `@nx/jest/plugin`，项目级覆盖写在各自的 `project.json` 中。`lint`、`build`、`test` 和 `typecheck` 默认启用缓存；`serve` 是持续运行目标，不启用缓存。

## 3. 高风险改动区

修改以下文件时，默认按影响面较大的改动处理，并检查第 4 节的联动项：

| 文件 | 主要影响 |
| --- | --- |
| `package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml` | 依赖解析、脚本、工作区包发现、安装行为 |
| `nx.json` | 目标推断、缓存、任务依赖、全仓库执行行为 |
| `tsconfig.base.json`、根 `tsconfig.json` | NodeNext ESM、项目引用、类型检查和构建行为 |
| 各项目 `package.json` 的 `exports` | 内部包导入、`@nx-learn/source` 条件、构建产物入口 |
| 各项目 `project.json` | Nx 目标、serve / build / test 行为、任务缓存 |
| `apps/*/nest-cli.json`、`apps/*/.swcrc` | Nest 构建器、SWC 编译、装饰器元数据 |
| 各项目 `jest.config.*`、`tsconfig.spec.json` | 单测运行环境、ESM / SWC 转换、测试发现范围 |
| `apps/*/src/main.ts` | 全局前缀、监听端口、应用启动行为 |
| `apps/*/src/app/app.module.ts` | 全局模块、定时任务、Provider 注入范围 |
| 根 `eslint.config.mjs` | 全仓库 lint 规则和模块边界检查 |

## 4. 联动修改规则

### 4.1 修改 Nest 应用源码

如果修改 `apps/esm-nest-jest/src` 或 `apps/esm-nest-swc/src`，必须判断另一个并行应用是否需要同步。两个应用当前业务代码基本一致，但构建和测试栈不同；修复业务行为时通常要检查两边，修复编译栈问题时只改对应项目。

### 4.2 修改启动、模块或定时任务

如果修改 `main.ts`、`app.module.ts` 或 `cron.service.ts`，必须检查：

- 全局前缀 `/api` 是否仍符合预期。
- `ScheduleModule.forRoot()` 和 `CronService` 的注册关系是否正确。
- `serve` 目标是否仍能通过构建产物 `dist/main.js` 启动。

### 4.3 修改共享库

如果修改 `libs/common` 或 `libs/test`，必须检查：

- `src/index.ts` 是否正确导出公共 API。
- 对应 `package.json` 的 `exports` 是否仍匹配构建产物。
- 依赖方向是否仍是 `apps -> @nx-learn/common -> @nx-learn/test`，不要引入反向依赖或循环依赖。
- 受影响应用和依赖库的 `build`、`typecheck`、`test` 是否需要一起跑。

### 4.4 修改构建或测试配置

如果修改 `project.json`、`tsconfig*.json`、`jest.config.*`、`nest-cli.json` 或 `.swcrc`，必须检查：

- 改动影响的是 `ts-jest` 应用、`swc` 应用，还是所有项目。
- ESM 运行所需的 `NODE_OPTIONS`、`TS_NODE_COMPILER_OPTIONS` 是否仍正确。
- `typecheck` 是否仍独立运行；构建成功不等于类型检查一定正确。
- 单个规格文件命令是否仍可用。

### 4.5 修改 ESM、导入或包导出

如果修改 `tsconfig.base.json`、项目 `package.json` 的 `exports`，或大范围调整 import，必须检查：

- 是否仍使用 NodeNext 解析。
- 相对 TypeScript 导入是否保留 `.js` 后缀。
- `@nx-learn/source` 自定义条件是否仍能指向源码入口。
- 构建产物和类型声明路径是否仍与 `exports` 对齐。

## 5. 实现原则与禁止行为

### 5.1 实现原则

- 编码前先看 `package.json` 和目标项目配置，确认当前使用的库、构建方式和验证命令。
- 默认沿用现有 Nest、Nx、Jest、TypeScript 和 ESM 组织方式。
- 已有服务、模块、验证器、库导出、测试配置和项目配置时，优先沿用，不新建一套平行结构。
- 新增类型、返回值或 DTO 时，用准确类型解决问题，不用 `any`、`unknown`、`as any`、`as unknown as ...` 掩盖类型错误。
- 状态值、类型值、任务值、开关值等业务常量不要散落魔法数字；需要新增时先抽成有语义的常量或枚举。
- 用户提供报错信息时，先定位原因和归属，再给最小修改方案。
- 复杂逻辑、边界判断、联动点和高风险改动点，应补必要中文注释。

### 5.2 禁止行为

除非用户明确要求或已说明充分理由，否则禁止：

- 绕过 Nx 目标直接新建一套构建、测试或启动流程。
- 为某个局部问题大范围重构无关代码。
- 为了消除表面问题改动根级 TypeScript、Nx、Jest 或 ESLint 配置而不检查影响范围。
- 修改一个 Nest 应用的业务行为，却完全不检查另一个并行应用是否需要同步。
- 修改共享库公共 API，却不检查消费者和 `exports`。
- 删除已有注释或中文内容后不确认语义和编码。
- 主动执行 `git add`、提交、改写提交或推送。

## 6. 验证要求与完成标准

### 6.1 最低验证要求

除非用户明确说不用验证，否则至少根据改动类型选择验证：

```sh
pnpm exec nx run-many -t lint
pnpm exec nx run-many -t typecheck
pnpm exec nx run-many -t test
pnpm exec nx run-many -t typecheck build lint test
```

局部改动优先跑受影响项目的目标，例如：

```sh
pnpm exec nx run esm-nest-jest:typecheck
pnpm exec nx run esm-nest-jest:build
pnpm exec nx test esm-nest-jest -- src/app/app.service.spec.ts
```

### 6.2 完成前自检

- 是否按第 4 节检查了联动项。
- 是否误删或错误修改已有注释。
- 新增或修改的复杂逻辑是否补了必要中文注释。
- 涉及中文的文件是否确认 UTF-8 中文没有乱码。
- 是否引入新的目录、构建、测试、导入或包导出约定；如果有，是否同步更新说明。
- 是否完成必要验证，或明确说明未验证原因。

### 6.3 完成标准

任务完成必须满足：功能正确、无明显联动遗漏、没有绕开现有架构、符合现有模式，并且已完成必要验证或说明未验证原因。

## 7. 输出要求

每次修改代码或文档后，默认说明：

1. 改了哪些文件。
2. 为什么这样改。
3. 是否存在联动影响。
4. 已做哪些验证，或建议如何验证。

如果任务涉及第 3 节高风险文件，还必须说明影响面和仍未覆盖的风险点。
