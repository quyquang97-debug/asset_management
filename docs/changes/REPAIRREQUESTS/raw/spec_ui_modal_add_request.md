# ASSET MANAGEMENT SYSTEM - WIREFRAME SPECIFICATION

## OVERVIEW
Desktop web application for managing assets and repair requests with a sidebar navigation, data table, and modal form.

---

## LAYOUT STRUCTURE

### 1. MODAL DIALOG - "Add Repair Request"

**Overlay:** Semi-transparent dark background
**Modal Size:** ~600px width, auto height
**Position:** Center screen
**Background:** White
**Border Radius:** 8px

**Modal Header:**
- Title: "Add Repair Request"
- Close button (X) - top right

**Form Fields (Vertical Stack):**

1. **Asset Code (*)**
   - Label: "Asset Code (*)" - with asterisk for required
   - Input: Text field with placeholder "Input asset Code", là Assets Autocomplete, khi chọn thì Asset id được chọn
   - Validation message: "Asset Code is required" (red text, appears if empty)

2. **Requested by (*)**
   - Label: "Requested by (*)"
   - Input: Text field with placeholder "Input employee code", là Employees Autocomplete, khi chọn thì employee id được chọn
   - Validation message: "Requested by is required" (red text, appears if empty)

3. **Description**
   - Label: "Description" (optional - no asterisk)
   - Input: Textarea (multiline)
   - Placeholder: "Input description"
   - Height: ~100px

4. **Request date (*)**
   - Label: "Request date (*)"
   - Input: Date picker with placeholder "Default current date"
   - Icon: Calendar icon on right
   - Validation message: "Request date is required" (red text, appears if empty)

**Modal Footer:**
- "Save" button (dark green background, white text)
- "Close" button (gray background, dark text)
- Alignment: Right side

---

## COLOR PALETTE

**Primary Colors:**
- Dark Green: #016242 (sidebar, buttons)
- Light Green: #EBFFEE (table row alternating)
- Dark Gray/Black: #2C2C2C (text, icons)
- White: #FFFFFF (backgrounds)
- Light Gray: #F2F0F0 (table header)
- Border Gray: #D9D9D9, #B3B3B3

**Accent Colors:**
- Red: For error messages/validation
- Text Gray: #625B71 (secondary text)

---

## TYPOGRAPHY

**Fonts:**
- Primary: Inter (Regular, Semi-Bold, Bold)

**Font Sizes:**
- Page Title: 24-28px
- Section Headers: 16-18px
- Table Headers: 12px (bold)
- Table Content: 12-14px
- Form Labels: 14-16px
- Buttons: 14-16px

---

## INTERACTIVE ELEMENTS

**Buttons:**
- Primary: Dark green background (#016242), white text, rounded 8px
- Secondary: Gray background, dark text, rounded 8px
- Icon buttons: Dark background (#2C2C2C), white icon, rounded 8px, size 32x32px

**Input Fields:**
- Border: 1px solid #D9D9D9
- Border Radius: 8px
- Padding: 12px
- Focus state: Darker border

**Checkboxes:**
- Unchecked: Light gray (#D9D9D9) with border
- Checked: Dark background (#2C2C2C) with white checkmark
- Size: 16x16px
- Border radius: 4px

**Dropdowns/Selects:**
- Same styling as input fields
- Down arrow icon on right

**Date Picker:**
- Same styling as input fields
- Calendar icon on right

---

## RESPONSIVE BEHAVIOR

**Desktop Primary (1440px+):**
- Full layout as described
- Sidebar fixed at 256px

**Tablet (768px - 1439px):**
- Consider collapsible sidebar
- Table may scroll horizontally

**Mobile (< 768px):**
- Sidebar converts to hamburger menu
- Table becomes card-based layout
- Form fields stack vertically (already vertical)

---

## DATA STRUCTURE

**Asset/Repair Request Object:**
```javascript
{
  id: number,
  assetCode: string,
  requestedBy: string (employee code),
  status: string (enum: 'all', 'pending', 'approved', 'completed'),
  description: string (optional),
  requestDate: Date,
  selected: boolean (for checkbox)
}
```

---

## USER INTERACTIONS

**Form Validation:**
- Asset Code: Required field
- Requested by: Required field
- Request date: Required field
- Description: Optional field

---

## STATE MANAGEMENT NEEDS

**Modal State:**
- Is modal open (boolean)
- Form field values
- Form validation errors
- Loading state (on save)

---

## ACCESSIBILITY REQUIREMENTS

- ARIA labels for icons/buttons
- Focus indicators
- Screen reader support
- Color contrast compliance (WCAG AA)
- Form validation error announcements

---

## END OF WIREFRAME SPECIFICATION
