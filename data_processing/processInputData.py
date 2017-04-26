from xlrd import open_workbook
import csv
import re

which_sheets = [(9, "higher_ed_economy_0_0"), (10, "higher_ed_economy_0_1"), (11, "higher_ed_economy_0_2"), (12, "higher_ed_economy_0_3"), (15, "higher_ed_economy_1_0"), (16, "higher_ed_economy_2_0"), (17, "higher_ed_economy_3_0"), (20, "students_funding_1_0"), (21, "students_funding_0_0"), (22, "students_funding_0_1"), (23, "students_funding_0_2"), (24, "students_funding_0_3"), (25, "students_funding_0_4"), (26, "students_funding_1_1"), (27, "students_funding_1_2"), (28, "students_funding_1_3"), (31, "sector_by_sector_0_0"), (32, "sector_by_sector_1_0"), (33, "sector_by_sector_2_0"), (34, "sector_by_sector_3_0"), (35, "sector_by_sector_4_0"), (38, "sector_by_sector_0_1"), (39, "sector_by_sector_1_1"), (40, "sector_by_sector_2_1"), (41, "sector_by_sector_3_1"), (42, "sector_by_sector_4_1"), (45, "sector_by_sector_0_2"), (46, "sector_by_sector_1_2"), (47, "sector_by_sector_2_2"), (48, "sector_by_sector_3_2"), (49, "sector_by_sector_4_2"), (52,"sector_by_sector_0_3"), (53,"sector_by_sector_1_3"), (54,"sector_by_sector_2_3"), (55,"sector_by_sector_3_3"), (56,"sector_by_sector_4_3"), (57, "purpose_accountability_0_0"), (58, "purpose_accountability_1_0"), (59, "purpose_accountability_2_0"), (60, "purpose_accountability_3_0"), (63, "purpose_accountability_4_0"), (64, "purpose_accountability_5_0"), (65, "purpose_accountability_6_0"), (68, "government_involvement_0_0"), (69, "government_involvement_1_0"), (70, "government_involvement_2_0"), (71, "paying_for_college_0_0"), (72, "paying_for_college_1_0")]
	
def writeSheet(sheet, sheet_title):
	print("writing " + sheet_title)
	fieldnames = ["category", "display_name"]
	input_row_defs = []

	number_of_rows = sheet.nrows
	number_of_columns = sheet.ncols
	for row in range(5, number_of_rows):
		curr_val = sheet.cell(row, 0).value
		# print(row, curr_val)
		if curr_val == 'Sigma':
			break

		if curr_val != '':
			curr_val_cleaned = curr_val.lower().replace(" ", "_").replace("/", "_").replace("_(net)", "").replace("'", "")
			print(curr_val_cleaned)
			curr_val_cleaned = re.sub("unweighted_base:(.)*","total_base", curr_val_cleaned)
			print(curr_val_cleaned)
			fieldnames.append(curr_val_cleaned)
			input_row_defs.append((row, curr_val_cleaned))

	output_rows = []

	for col in range(1, number_of_columns):
		curr_row = {}
		col_title = sheet.cell(3, col).value
		# print(col_title)
		curr_row["display_name"] = col_title
		col_title_cleaned = col_title.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("x-ers", "xers").replace("-", "_to_").replace("<", "less_than_").replace("+", "_plus").replace("$", "").replace(",", "")
		curr_row["category"] = col_title_cleaned

		for row_def in input_row_defs:
			row_number = row_def[0]
			row_title = row_def[1]
			curr_row[row_title] = sheet.cell(row_number, col).value
			
		output_rows.append(curr_row)

	# print(output_rows)

	with open("./cleaned_data/" + sheet_title + '.csv', 'w') as csvfile:
		writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
		writer.writeheader()

		for row in output_rows:
			writer.writerow(row)


wb = open_workbook('./raw_data/final_survey_data.xlsx')

for sheet_def in which_sheets:
	sheet = wb.sheets()[sheet_def[0]]
	writeSheet(sheet, sheet_def[1])
