function TableEdit() {
	this.cellIndexForElement = function(el) {
		return { row : $(el).closest('tr').index(),
				col : $(el).closest('td').index() }
	};

	function makeCellEditable(classSuffix, value, isNewItem = false) {
		return '<input type="text" class="input-' + 
		classSuffix + (isNewItem ? " new-item" : "") +
			'" value="' + value + '">' + resizerLine;
	}

	function activateEditingMode() {
		tableBody.children('tr').each(function() {
			for(var i = 0; i < columnNames.length; i++) {
				var td = $(this).children('td')[i],
				  cellDiv = $(td).find('.cell'),
				  currentText = $(cellDiv).text();
				$(cellDiv).html(makeCellEditable(
					columnNames[i], currentText));				
			}
			addActionsColumn($(this));
		});
		addActionsColumn(tableHeader.children('tr:first-child'), true);		
		adjustTableWidthToActionsColumn(true);

		self.addEmptyRow();
		$('td input[type=text]').on('change', onInputChanged);
		activateResizeMode();
	}

	function addActionsColumn(row, isHeader = false) {
		var actionsCell = '';
		if (isHeader) {
			actionsCell = "<th class=\"actions-column\">Actions</th>";
		}
		else {
			actionsCell = "<td>" + deleteButton + "</td>";
		}
		row.append(actionsCell);
	}

	function adjustTableWidthToActionsColumn(toAdd) {
		 var tableWidth = getWidth(self.table),
			 actionColumnWidth =$('.actions-column').last().outerWidth();
		 if (tableWidth && actionColumnWidth) {
		 	self.table.css('width', tableWidth + actionColumnWidth * (toAdd ? 1 : -1));
		 }
	}

	function onInputChanged() {
		var index = self.cellIndexForElement(this);
		updateData(index.row, index.col, $(this).val());
	}

	function updateLocalStorage() {
		localStorage['tableData'] = JSON.stringify(tableData);
	}

	function updateData(row, col, value) {
		tableData[row][columnNames[col]] = value;
		updateLocalStorage();
	}

	this.addEmptyRow = function() {
		tableBody = this.table.find('tbody');
		var newRowHtml = '<tr>';
		for (var i = 0; i < columnNames.length; i++) {
			newRowHtml += "<td><div class=\"cell\">" + 
			makeCellEditable(columnNames[i], '', true) +			
			"</div></td>";
		}
		newRowHtml += "<td></td></tr>'";		
		tableBody.append(newRowHtml);
		$('.new-item').on('change', newItemChanged);
		$('.new-item').on('change', onInputChanged);		
	}

	function deactivateEditingMode() {
		$('input[type=text]').off();
		tableBody.children('tr').each(function() {
			$(this).children('td').each(function() {
				var currentText = $(this).find('input').val();
				var cellDiv = $(this).find('.cell');
				$(cellDiv).html(currentText);
			});
			$(this).children('td:last-child').remove();
		});
		tableBody.children('tr:last-child').remove();
		deactivateResizeMode();
		adjustTableWidthToActionsColumn(false);
		tableHeader.children('tr:first-child').children('th:last-child').remove();		
	}

	function newItemChanged() {
		var newItemDirty = false;
		tableBody.find('.new-item').each(function(){
			if ($(this).val != '') {
				newItemDirty = true;
				return false;				
			}
		});

		if (newItemDirty) {
			tableBody.find('.new-item').each(function() {
				$(this).removeClass('new-item');
				$(this).off('change', newItemChanged);			
			});
			tableBody.children('tr').last().children("td").last()
				.html(deleteButton);				
			
			tableData.push({});
			self.addEmptyRow();
		}
	}

	function populateTable() {
		var tableHtml = "<thead><tr>";
		for(var i = 0, x = columnNames.length; i < x; i++) {
			tableHtml += ("<th><div class=\"cell\">" + columnNames[i] + "</div></th>");	
		}

		tableHtml += "</tr><thead><tbody>";
		for(var i = 0, x = tableData.length; i < x; i++) {
			tableHtml += "<tr>";
			for (var j = 0; j < columnNames.length; j++) {
				var cellValue = 
					(tableData[i][columnNames[j]] !== undefined) ?
					tableData[i][columnNames[j]] : "";
				tableHtml += ("<td><div class=\"cell\">" + cellValue + "</div></td>");				
			}
			tableHtml += "</tr>";
		}
		tableHtml += "</tbody>";		
		self.table.append(tableHtml);
		tableBody = self.table.find('tbody');
		tableHeader = self.table.find('thead');
	}

	function connectDeleteButtons() {
		$('tbody').on('click', '.delete-btn', function() {
			deleteRow($(this).closest('tr').index());
		});
	}

	function deleteRow(row) {
		tableBody.children('tr')[row].remove();
		tableData.splice(row, 1);
		updateLocalStorage();
	}	

	function getHeaderCell(resizer) {
		var cell = $(resizer).closest('td, th');
		var col = $(cell).index();
		return self.table.find('th:nth-child(' + (col + 1)+ ')');
	}
  
    function columnCount() {
		return tableBody.children("tr:first-child").children('td').length;
	}	
	
	function resizeColumn(headerCell, cellWidth, nextCellWidth, tableWidth, difference) {
		var col = $(headerCell).index();
		$(headerCell).css('width', cellWidth + difference);

		if (col == columnCount() - 2) {	// 2 because last column is not resizable
			self.table.css('width', tableWidth + difference);
		}	

		if ((columnCount() > 1) && (col < columnCount() - 2)) {	
			$(headerCell).next('th').css('width', nextCellWidth - difference);
		}
	}

	function getWidth(element) {
		return parseInt(element.css('width'), 10);
	}

	function activateResizeMode() {
		tableHeader.find('tr:first-child').children('th').each(function() {
			var cellDiv = $(this).find('.cell');
			$(cellDiv).append(resizerLine);			
		});	

		var xBeforeMove,
		    xAfterMove,
		    borderCaptured = false,
		    capturedHeaderCell,
		    widthBeforeMove,
		    nextWidthBeforeMove,
		    tableWidthBeforeMove;

		self.table.on('mousedown', '.left-resizer', function(e) {			
			xBeforeMove = e.clientX;
			borderCaptured = true;	
			capturedHeaderCell = getHeaderCell(this);
			widthBeforeMove = getWidth($(capturedHeaderCell));
			nextWidthBeforeMove = getWidth($(capturedHeaderCell).next('th'));
			tableWidthBeforeMove = getWidth(self.table);		
			$(capturedHeaderCell).css('width', widthBeforeMove);		
		})		

		$(window).on('mousemove', function(e) {		
			xAfterMove = e.clientX;
			if (borderCaptured && (xAfterMove != xBeforeMove)) {				
				var diff = xAfterMove - xBeforeMove;
				resizeColumn(capturedHeaderCell, widthBeforeMove, nextWidthBeforeMove, tableWidthBeforeMove, diff);
			}
		})
		.on('mouseup', function() {
			borderCaptured = false;
		});
	}

	function deactivateResizeMode() {
		self.table.find('tr').each(function() {
			$(this).children('td, th').each(function() {
				$(this).find('.left-resizer').remove();							
			});
		});
	}

	function fetchTableData() {
		if (localStorage["tableData"]) {
			tableData = JSON.parse(localStorage["tableData"]);
		}
		else {
			tableData =
				[{ name: "John", age: 29, country: 'USA' },
				{ name: "Paul", age: 27, country: 'Germany' },
				{ name: "Vladimir", age: 26, country: 'Russia' }]
		}	
	}
  
	function initialize() {
		fetchTableData();
		populateTable(tableData);
		connectDeleteButtons();	

		// Firefox remembers form state after page refresh
		$('#edit-table-check').prop('checked', false);
		$('#edit-table-check').on('change', function() {
			if(this.checked) {
				activateEditingMode();
			}
			else {
				deactivateEditingMode();
			}
		});		
	}

	this.getBody = function() { return tableBody; }

	var self = this;
	this.table = $('table#table-edit');
	var tableBody,
		tableHeader;
	const deleteButton = "<button class=\"delete-btn\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></button>";
	const resizerLine = "<div class=\"left-resizer\" title=\"Drag to resize\"></div>";	
	var tableData = [];
	const columnNames = ['name', 'age', 'country'];	

	initialize();
}

$(document).ready(function() {
	var tableEdit = new TableEdit();
});