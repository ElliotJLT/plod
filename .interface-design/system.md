# Plod Design System

## Philosophy

Plod is a calm companion for casual runners. The interface should feel like a quiet friend, not a drill sergeant or a flashy sports app.

**Core Principles:**
- **Quiet confidence** — Progress is shown, not celebrated loudly
- **Generous breathing room** — Space creates calm
- **Intentional restraint** — When in doubt, remove
- **Warmth without energy** — Soft, not sporty

## Spacing Scale (4px base)

| Token | Value | Usage |
|-------|-------|-------|
| `space-1` | 4px | Tight internal padding |
| `space-2` | 8px | Default gap between inline elements |
| `space-3` | 12px | Card internal padding (compact) |
| `space-4` | 16px | Card internal padding (default) |
| `space-5` | 20px | Section gaps |
| `space-6` | 24px | Major section separation |
| `space-8` | 32px | Page-level breathing room |

## Typography

**Hierarchy:**
- Page title: `text-xl font-medium` — Confident, not shouty
- Section label: `text-xs text-muted-foreground uppercase tracking-wider` — Whispered context
- Primary data: `text-2xl font-light` — The star, but understated
- Secondary info: `text-sm text-muted-foreground` — Supporting quietly
- Body text: `text-sm text-foreground` — Clear and readable

**Rules:**
- Never use bold for emphasis in body text
- Numbers should be `font-light` to feel less aggressive
- Labels are always muted, never compete with data

## Color Strategy

**Dark theme (default):**
- Background: Near-black `hsl(240 6% 6%)` — Deep, restful
- Card surface: Slightly lifted `hsl(240 5% 8%)` — Subtle distinction
- Border: Very subtle `hsl(240 4% 16%)` — Present but not harsh
- Accent: Soft teal `hsl(168 56% 40%)` — Calm energy, not sporty
- Muted text: `hsl(240 5% 55%)` — Readable but recedes

**Forbidden colors:**
- Bright red (use muted orange for warnings)
- Neon/electric anything
- Pure white text (use off-white)

## Depth Strategy

**Borders-only approach:**
- No drop shadows on cards
- 1px borders provide separation
- Hover states use border color shift, not elevation
- Focus uses accent ring, subtle

```css
/* Card default */
.card {
  border: 1px solid hsl(240 4% 16%);
  border-radius: 12px;
  background: hsl(240 5% 8%);
}

/* Card interactive hover */
.card:hover {
  border-color: hsl(168 56% 40% / 0.3);
}
```

## Component Patterns

### Cards
- Border radius: `rounded-xl` (12px)
- Padding: `p-4` default, `p-3` compact
- Always have subtle border
- No shadows

### Buttons
- Primary: Accent background, white text
- Secondary: Transparent with border
- Ghost: No border, just text
- All use `rounded-lg` (8px)

### Progress indicators
- Use thin bars (`h-1`) not thick
- Accent color for progress
- Muted background track
- No animations on load, only on change

### Icons
- Size: `h-5 w-5` default, `h-4 w-4` in compact contexts
- Stroke width: 1.5 (lighter than default)
- Color: Inherit from text, accent for interactive

## Motion

**Principles:**
- Subtle over flashy
- Quick over slow (150-200ms)
- Ease-out for entrances
- No bounce or spring

**Allowed animations:**
- Fade in/out
- Slide up (for sheets)
- Scale (very subtle, 0.98 → 1)
- Color transitions

**Forbidden:**
- Confetti or celebration
- Pulsing or throbbing
- Aggressive attention-grabbing

## Layout

**Mobile-first (375px minimum):**
- Max content width: 448px (md:max-w-md)
- Page padding: 16px horizontal
- Bottom nav: 64px height (h-16)
- Safe area: 80px bottom padding on pages

**Grid:**
- 7-column for week calendar
- Single column for everything else
- No complex multi-column layouts

## States

**Empty states:**
- Centered, icon + text
- Muted, not sad or pushy
- Single action if needed

**Loading:**
- Skeleton with subtle pulse
- Match exact layout of loaded state
- No spinners

**Error:**
- Inline, near the problem
- Muted orange, not red
- Actionable message

## Voice (in UI copy)

- Neutral, not cheerful
- Present tense
- No exclamation marks
- No "Great job!" or similar

Examples:
- ✓ "5km logged"
- ✗ "Awesome! You crushed that 5km!"
- ✓ "This run was moved"
- ✗ "Oops! You missed your run"
