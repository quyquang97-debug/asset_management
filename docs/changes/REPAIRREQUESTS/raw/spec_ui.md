# Asset Management Interface - Wireframe Specification

## Layout Structure

### 1. Header Section (Full Width, Dark Green Background #0B5C4A)
```
[LOGO: BRYCEN]  |  ASSET MANAGEMENT (Active) | REPAIR REQUESTS  |  [USER AVATAR: Henry Nguyen]
```

**Components:**
- Left: BRYCEN logo (imported SVG)
- Center: Navigation tabs
  - "ASSET MANAGEMENT" (active, bold, dark green text)
  - "REPAIR REQUESTS" (inactive, regular text)
- Right: User profile section
  - Circular avatar image
  - "Henry Nguyen" text below

---

### 2. Search Filters Section (White Background, Padding)
```
Asset Code                    Requested by                   Status
[Input: "Input asset Code"]   [Input: "Input employee code"] [Dropdown: "all" ▼]

                                                               [Search] [Clear]
```

**Layout:** 3-column grid
- Column 1: Asset Code
  - Label: "Asset Code"
  - Input field with placeholder "Input asset Code"
- Column 2: Requested by
  - Label: "Requested by"
  - Input field with placeholder "Input employee code"
- Column 3: Status
  - Label: "Status"
  - Dropdown with default value "all"
  - Options: all, open, in progress, cancelled, done

**Action Buttons (Right-aligned):**
- "Search" button (Green background #0B5C4A, white text)
- "Clear" button (Green background #0B5C4A, white text)

---

### 3. Table Action Buttons
```
[Add] [Delete]
```
- Both buttons: Green background (#0B5C4A), white text, rounded
- Positioned above the table, left-aligned

---

### 4. Data Table (Full Width)
```
┌─────┬────┬─────────────┬──────────────┬──────────────┬──────────────┬───────────┬─────────────┐
│ [✓] │ ID │ Asset Code  │ Asset Name   │ Requested by │ Request date │ Status    │ Action      │
├─────┼────┼─────────────┼──────────────┼──────────────┼──────────────┼───────────┼─────────────┤
│ [✓] │ 1  │ LAP2024BC.. │ Laptop       │ Bui Minh Tien│ 09/03/2026   │ open      │ [📝][👁][🔄]│
├─────┼────┼─────────────┼──────────────┼──────────────┼──────────────┼───────────┼─────────────┤
│ [✓] │ 2  │ PHONE       │ Phone        │ Khoa         │ 09/03/2026   │ in progress│ [📝][👁][🔄]│
├─────┼────┼─────────────┼──────────────┼──────────────┼──────────────┼───────────┼─────────────┤
│ [✓] │ 3  │ MAC         │ Macbook      │ Duy          │ 09/03/2026   │ open      │ [📝][👁][🔄]│
└─────┴────┴─────────────┴──────────────┴──────────────┴──────────────┴───────────┴─────────────┘
```

**Table Columns:**
1. **Checkbox** - Select row (20px width)
2. **ID** - Row number (40px width)
3. **Asset Code** - Asset identifier (120px width)
4. **Asset Name** - Name of asset (120px width)
5. **Requested by** - Employee name (120px width)
6. **Request date** - Date in DD/MM/YYYY format (120px width)
7. **Status** - Status badge (100px width)
8. **Action** - Action buttons (120px width)

**Row Styling Rules:**
- Alternating row colors:
  - Selected/Checked rows: Light green background (#E8F5E9)
  - Unchecked rows: White background
  - Cancelled rows (status="cancelled"): Light gray background (#F5F5F5)
  - Done rows (status="done"): Very light green (#F1F8F4)

**Status Badges:**
- "open": Default text, no special styling
- "in progress": Yellow/orange indicator
- "cancelled": Gray text
- "done": Subtle text

**Action Buttons (Per Row):**
- Edit icon button (pencil on dark background)
- View icon button (eye on dark background)
- Refresh/Sync icon button (circular arrows on dark background)
- Disabled state for cancelled/done rows: Grayed out icons

---

### 5. Pagination Section (Bottom, Space Between Layout)
```
Records per page [10 ▼]          1-10 of 60          [|<] [<] [>] [>|]
```

**Left Side:**
- Text: "Records per page"
- Dropdown: Options (10, 20, 50, 100)

**Center:**
- Text: "1-10 of 60" (current range and total)

**Right Side:**
- First page button [|<]
- Previous page button [<]
- Next page button [>]
- Last page button [>|]
- All buttons: Dark background when active, disabled state when not applicable

---

## Data Structure

### Sample Data Array:
```javascript
const assets = [
  { id: 1, code: "LAP2024BC10050", name: "Laptop", requestedBy: "Bui Minh Tien", date: "09/03/2026", status: "open", checked: true },
  { id: 2, code: "PHONE", name: "Phone", requestedBy: "Khoa", date: "09/03/2026", status: "in progress", checked: true },
  { id: 3, code: "MAC", name: "Macbook", requestedBy: "Duy", date: "09/03/2026", status: "open", checked: true },
  { id: 4, code: "TAB", name: "Tablet", requestedBy: "Quang", date: "09/03/2026", status: "cancelled", checked: false },
  { id: 5, code: "Case", name: "Computer case", requestedBy: "Hoa", date: "09/03/2026", status: "done", checked: false },
  { id: 6, code: "Mouse", name: "Computer mouse", requestedBy: "Luyn", date: "09/03/2026", status: "open", checked: true },
  { id: 7, code: "Keyboard", name: "Computer keyboard", requestedBy: "Thanh", date: "09/03/2026", status: "open", checked: true },
  { id: 8, code: "Screen", name: "Computer monitor", requestedBy: "Nhat", date: "09/03/2026", status: "open", checked: true },
  { id: 9, code: "Chair", name: "Chair", requestedBy: "Hioeu", date: "09/03/2026", status: "open", checked: true },
  { id: 10, code: "UPS", name: "UPS", requestedBy: "Ngic", date: "09/03/2026", status: "open", checked: true }
];
```

---

## Color Palette
- Primary Green: #0B5C4A
- Light Green (selected rows): #E8F5E9
- Very Light Green (done rows): #F1F8F4
- Light Gray (cancelled): #F5F5F5
- Dark Gray (disabled): #9E9E9E
- Background: #F8F8F8
- White: #FFFFFF
- Text Primary: #1A1A1A
- Text Secondary: #666666

---

## Responsive Behavior
- Desktop (1200px+): Full table layout as shown
- Tablet (768px-1199px): Scrollable table, fixed action columns
- Mobile (< 768px): Card-based layout for each row

---

## Interactive States

### Buttons:
- Hover: Slightly darker background
- Active/Pressed: Even darker
- Disabled: Gray background, reduced opacity

### Table Rows:
- Hover: Slight shadow or border highlight
- Selected: Maintain green background
- Click checkbox: Toggle selection state

### Inputs:
- Focus: Blue border
- Error: Red border
- Filled: Normal state

---

## Functionality Requirements

1. **Search/Filter:**
   - Filter by Asset Code (partial match)
   - Filter by Requested by (partial match)
   - Filter by Status (exact match or "all")
   - "Clear" button resets all filters

2. **Table Actions:**
   - "Add" opens modal/form to add new asset
   - "Delete" removes all checked rows (with confirmation)
   - Bulk selection via header checkbox

3. **Row Actions:**
   - Edit: Open edit form with row data
   - View: Open view modal with full details
   - Refresh: Reload/sync row data
   - Actions disabled for cancelled/done status

4. **Pagination:**
   - Change records per page
   - Navigate between pages
   - Display current range and total

5. **Tab Navigation:**
   - Click "REPAIR REQUESTS" to switch views
   - "ASSET MANAGEMENT" is current active tab

---

## Technical Notes

- Use imported BRYCEN logo SVG from `/src/imports/svg-p2l4bgq7o2.ts`
- Use imported AssetManagement component as reference from `/src/imports/AssetManagement.tsx`
- Table should be sortable by clicking column headers
- Implement proper TypeScript types for all data structures
- Use React state management for filters, pagination, and selection
- Icons: Use lucide-react (Pencil, Eye, RotateCw for actions)
