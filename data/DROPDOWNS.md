# Dropdowns (data/dropdowns.json)

This file defines all dropdown options used in case forms and reports filters. Settings page lets you edit them (stored in localStorage overrides).

## Form fields covered

Every `<select>` in the case form is wired to a key in `SELECT_TO_KEY` (js/settings.js) and has a matching array in this JSON:

| Key | Form select id(s) | Notes |
|-----|-------------------|--------|
| phases | currentPhase, filterPhase | id + en/ar; 1–9 |
| reporterType | reporterType | |
| reporterSource | reporterSource | |
| reportType | reportType | |
| geographic | geographic | Country/region |
| geographicCity | geographicCity | **Depends on geographic** – options filtered by selected country |
| pdplAction | pdplAction | |
| reporterStatus | reporterStatus | |
| currentStatus | currentStatus, filterStatus | |
| scopeType | scopeType | |
| escalationLevel | escalationLevel | |
| severity | severity | |
| investigatingBody | investigatingBody | |
| caseAcceptanceStatus | caseAcceptanceStatus | |
| legalPrivilege | legalPrivilege | |
| interviewClassification | interviewClassification | |
| rightsNotified | rightsNotified | |
| documentationMethod | documentationMethod | |
| formOfEvidence | formOfEvidence | |
| dataCategory | dataCategory | |
| examinationType | examinationType | |
| supportingParty | supportingParty | |
| partyType | partyType | |
| natureOfCommunication | natureOfCommunication | |
| encryption | encryption | |
| writtenAgreement | writtenAgreement | |
| recommendationType | recommendationType | |
| disciplinaryAction | disciplinaryAction | |
| mandatoryLevel | mandatoryLevel | |
| impactCurrency | impactCurrency | |
| filterPath | filterPath | Green / Yellow / Red |

## Cascading (dependent lists)

- **geographicCity** depends on **geographic**: when the user selects a country (KSA, Qatar, Bahrain, Kuwait), the City dropdown is filled only with cities that have `"geographic": "KSA"` (or the selected value). Options in `geographicCity` can include an optional `"geographic"` field for this filter.

Defined in `js/settings.js` as `DEPENDS_ON = { geographicCity: 'geographic' }`.

## Comma-separated paste (Settings)

In Settings → Edit options, use **Paste comma-separated** to paste a line like:

`Riyadh, Jeddah, Dammam, Mecca`

Each comma-separated value becomes one new row (Value and Label EN set to that text; Label AR empty). Fill Country (for City list) or other columns as needed, then Save. Useful when copying from a Data sheet where options were in one cell separated by commas.

## Option shape

- **phases**: `{ "id": 1, "en": "...", "ar": "..." }`
- **All others**: `{ "value": "...", "labelEn": "...", "labelAr": "..." }`
- **geographicCity** only: may add `"geographic": "KSA"` (or Qatar, Bahrain, Kuwait) for cascading.
