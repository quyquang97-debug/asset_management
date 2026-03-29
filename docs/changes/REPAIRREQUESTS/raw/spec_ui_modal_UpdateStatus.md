# ASSET MANAGEMENT - WIREFRAME SPECIFICATION

## LAYOUT STRUCTURE

```
                    ┌───────────────────────────────────────┐
                    │  MODAL: Update Repair Request Status │
                    │  ───────────────────────────────────  │
                    │  ID: 1                                │
                    │                                       │
                    │  Status:                              │
                    │  [done ▼]                            │
                    │                                       │
                    │  Repair date (*):                     │
                    │  [09/03/2026] 📅                     │
                    │                                       │
                    │  Description:                         │
                    │  [Thay nguon_________________]        │
                    │                                       │
                    │  Cost:                                │
                    │  [1,000,000___________________]       │
                    │                                       │
                    │  Performed by:                        │
                    │  [Sang Thanh Binh____________]        │
                    │                                       │
                    │  [Save Button] [Close Button]        │
                    └───────────────────────────────────────┘
```

## COMPONENT SPECIFICATIONS

### 1. MODAL: Update Repair Request Status
**Width:** ~600px
**Background:** White
**Position:** Centered overlay
**Border radius:** 8px
**Shadow:** Large

#### Header:
- **Title:** "Update Repair Request Status"
- **Close button:** ✕ (top right)

#### Form Fields:
1. **ID:**
   - Label: "ID"
   - Value: "1"
   - Read-only

2. **Status Dropdown:**
   - Label: "Status"
   - Default: "done"
   - Dropdown with arrow

3. **Repair Date:**
   - Label: "Repair date (*)"
   - Input: Date picker
   - Icon: Calendar (📅)
   - Value: "09/03/2026"

4. **Description:**
   - Label: "Description"
   - Input: Textarea
   - Placeholder/Value: "Thay nguon"
   - Rows: 3-4

5. **Cost:**
   - Label: "Cost"
   - Input: Text
   - Value: "1,000,000"

6. **Performed by:**
   - Label: "Performed by"
   - Input: Text
   - Value: "Sang Thanh Binh"

#### Footer Buttons:
- **Save Button:**
  - Background: #016242
  - Text: "Save"
  - Color: white
  - Border radius: 4px

- **Close Button:**
  - Background: #9e9e9e (gray)
  - Text: "Close"
  - Color: white
  - Border radius: 4px

## COLOR PALETTE

```
Primary Green: #016242
Light Green (rows): #ebffee
Dark Gray (buttons/checkboxes): #2c2c2c
Border Gray: #b3b3b3
Header Gray: #f2f0f0
Text Purple: #625b71
Background Gray: #F5F5F5
White: #ffffff
Black: #1e1e1e, #000000
```

## TYPOGRAPHY

```
Font Family: Inter
Sizes:
  - Header Title: 24px (bold)
  - Tab: 16px (medium)
  - Table Header: 12px (bold)
  - Table Cell: 12px (regular)
  - Form Label: 14px (medium)
  - Form Input: 16px (regular)
  - User Name: 16px (semibold)
```

## INTERACTION STATES

### Buttons:
- **Hover:** Darker shade of background
- **Active:** Even darker shade
- **Disabled:** 50% opacity

### Inputs:
- **Focus:** Blue border (#016242)
- **Error:** Red border (#d32f2f)

1. **Modal Actions:**
   - Edit fields → Enable Save button
   - Click Save → Update data, close modal, refresh table
   - Click Close → Discard changes, close modal
   - Khi trạng thái = done thì các input sau Repair Date, Description, Cost, Performed by sẽ được enable và yêu cầu nhập dữ liệu, 

## ACCESSIBILITY

- All buttons have aria-labels
- Form inputs have proper labels
- Modal has focus trap
- Keyboard navigation supported
- Color contrast meets WCAG AA standards

