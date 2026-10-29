---
title: Spacer
description: Flexible empty box that takes up the free space in a row or column.
category: layout
---

`Spacer` grows to fill the leftover space in its flex parent, pushing siblings apart.

```svelte
<script>
  import Spacer from 'gpuix-fractalsvelte-ui/Spacer.svelte';
  import Stack from 'gpuix-fractalsvelte-ui/Stack.svelte';
</script>

<Stack direction="row" align="center">
  <span>Title</span>
  <Spacer />
  <span>Actions</span>
</Stack>
```

## Props

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| `style` | `string \| null` | `null` | Inline CSS on the spacer. |
| `testid` | `string \| null` | `null` | Test id on the spacer. |

## Tokens

None.

## Keyboard

None.

## GPUI notes

- Sizing is `flex-grow: 1` only. It works inside a flex row or column, and does nothing in a parent without flex.
- Set a size through `style` to keep a minimum gap, since the spacer itself has no minimum.
