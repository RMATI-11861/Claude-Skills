# CSV and spreadsheet pitfalls

- **Encoding.** Excel on Windows often saves CSV as Windows-1252 or as UTF-8 with BOM. Detect it before parsing; a stray BOM corrupts the first column name.
- **Brazilian locale.** `;` delimiter, decimal comma (`1.234,56`), dates as `dd/MM/yyyy`. Parse explicitly:
  - pandas: `pd.read_csv(path, sep=';', decimal=',', thousands='.', encoding='utf-8-sig')`, then `pd.to_datetime(df[col], format='%d/%m/%Y')`
  - duckdb: `read_csv('file.csv', delim=';', decimal_separator=',', dateformat='%d/%m/%Y')`
  - PowerShell 5.1: `Import-Csv -Path file.csv -Delimiter ';' -Encoding UTF8`, then `[decimal]::Parse($value, [Globalization.CultureInfo]'pt-BR')`
- **Leading zeros.** CPF, CNPJ, CEP and product codes lose them when read as numbers; read those columns as text.
- **Excel dates** may arrive as serial numbers (days since 1899-12-30).
- **.xlsx through Python:** `uv run --with pandas --with openpyxl python -X utf8 script.py`; `pd.read_excel(path, sheet_name=None)` loads every sheet.
- **Headers and totals inside the data** (merged header rows, subtotal lines): drop them explicitly and say so.
- **Money:** use `Decimal` or integer cents; floats drift on sums that must reconcile.
