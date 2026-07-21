# Catalyst Data Store — Simplified Prototype Schema

The public prototype intentionally recreates only the minimum operational entities needed for the demo.

## District
- `DistrictID` — BIGINT, Primary Key
- `DistrictName` — VARCHAR
- `Active` — BOOLEAN

## Unit
- `UnitID` — BIGINT, Primary Key
- `UnitName` — VARCHAR
- `DistrictID` — BIGINT
- `Active` — BOOLEAN

## CaseMaster
- `CaseMasterID` — BIGINT, Primary Key
- `CrimeNo` — VARCHAR, Unique
- `CaseNo` — VARCHAR
- `CrimeRegisteredDate` — DATE
- `PoliceStationID` — BIGINT
- `DistrictID` — BIGINT
- `CrimeMajorHead` — VARCHAR
- `CrimeMinorHead` — VARCHAR
- `Gravity` — VARCHAR
- `CaseStatus` — VARCHAR
- `IncidentFromDate` — DATETIME
- `Latitude` — DOUBLE
- `Longitude` — DOUBLE
- `BriefFactsRedacted` — TEXT

## Accused
- `AccusedMasterID` — BIGINT, Primary Key
- `CaseMasterID` — BIGINT
- `SyntheticPersonID` — VARCHAR
- `RepeatAppearanceFlag` — BOOLEAN

## ArrestSurrender
- `ArrestSurrenderID` — BIGINT, Primary Key
- `CaseMasterID` — BIGINT
- `AccusedMasterID` — BIGINT
- `ArrestSurrenderDate` — DATE
- `PoliceStationID` — BIGINT
- `IOID` — BIGINT

## ChargesheetDetails
- `CSID` — BIGINT, Primary Key
- `CaseMasterID` — BIGINT
- `CSDate` — DATETIME
- `CSType` — VARCHAR
- `PolicePersonID` — BIGINT

## Employee
- `EmployeeID` — BIGINT, Primary Key
- `DistrictID` — BIGINT
- `UnitID` — BIGINT
- `KGIDMasked` — VARCHAR
- `Designation` — VARCHAR

## Production indexes
- `CaseMaster(CrimeRegisteredDate)`
- `CaseMaster(DistrictID, PoliceStationID)`
- `CaseMaster(CrimeMinorHead, Gravity)`
- `Accused(SyntheticPersonID, CaseMasterID)`
- `ChargesheetDetails(CaseMasterID, CSDate)`
