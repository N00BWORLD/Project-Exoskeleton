# 💀 Project-Exoskeleton: Iron & Bone
**"A Hybrid Roguelite Idle RPG Engine built with Pure JavaScript."**

## Identity
- **Hybrid Genre:**
    - **Inflation RPG:** 30-Turn Limit per Run (Scarcity).
    - **Gold & Goblins:** Spatial Merge Defense (Tactical).
    - **Archero:** 3-to-1 Equipment Evolution (Progression).
- **Tech Stack:**
    - **No Engines:** Unity/Godot Banned.
    - **Core:** Pure JavaScript (ES6+) & HTML5 Canvas.
    - **Visual:** Custom Skeletal Animation Engine (Wireframe -> Sprite Socket System).

## Key Systems
### 1. The Loop (Session Based)
1. **Sortie (출격):** Choose Zone (Scrap Yard -> Core Factory).
2. **Battle (전투):** Use Battery (30 Turns). Kill Boss -> Recharge (+10).
3. **Return (귀환):** Reset Level/Units. Keep Inventory.
4. **Growth (성장):** Merge [Tier N] x3 -> [Tier N+1] x1.

### 2. Equipment Merge
- **Rule:** Simple 3-to-1 combination.
- **Inventory:** Grid-based management.
- **Visual:** Changing equipment updates the Skeleton's appearance in real-time.

### 3. Localization
- Full i18n support (Key-Value separation).

## Technical Specs
- **Socket System:** Bones have attachment points for swapping sprites.
- **Battery System:** Actions consume energy. Depletion forces prestige.
- **Data Storage:** `localStorage` for inventory and progress.

---
*Built by Antigravity*
