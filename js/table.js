$(document).ready(function() {
	function cellIndex(cell) {
		return {row : $(cell).closest('tr').index(),
				col : $(cell).closest('td').index()}
	};

	function makeCellEditable(classSuffix, value, isNewItem = false){
		return '<input type="text" class="input-' + 
		classSuffix + (isNewItem ? " new-item" : "") +
		 '" value="' + value + '">';
	}

	function activateEditingMode()
	{
		tableBody.children('tr').each(function() {
			var i = 0;
			for(var i = 0; i < columnNames.length; i++) {
				var td = $(this).children('td')[i];
				var cellDiv = $(td).find('.cell');
				var currentText = $(cellDiv).text();
				$(cellDiv).html(makeCellEditable(
					columnNames[i], currentText));				
			}
		});
		addEmptyRow();
		$('td input[type=text]').on('change', connectInputEvent);
		activateResizeMode();
	}

	function connectInputEvent(event) {
		var index = cellIndex(this);
		updateData(index.row, index.col, $(this).val());
	}

	function disconnectEvents() {
		$('input[type=text]').off();
	}

	function updateLocalStorage() {
		localStorage['tableData'] = JSON.stringify(tableData);
	}

	function updateData(row, col, value) {
		tableData[row][columnNames[col]] = value;
		updateLocalStorage();
	}

	function addEmptyRow()
	{
		var newRawText = '<tr>';
		for (var i = 0; i < columnNames.length; i++) {
			newRawText += "<td>" + 
			makeCellEditable(columnNames[i], '', true) +
			"</td>";
		}
		newRawText += "<td></td>"
		newRawText += '</tr>'
		tableBody.append(newRawText);
		$('.new-item').on('change', newItemChanged);
		$('.new-item').on('change', connectInputEvent);		
	}

	function deactivateEditingMode()
	{
		disconnectEvents();	
		tableBody.children('tr').each(function() {
			$(this).children('td').each(function() {
				var currentText = $(this).find('input').val();
				var cellDiv = $(this).find('.cell');
				$(cellDiv).html(currentText);
			});
		});
		tableBody.children('tr').last().remove();
		deactivateResizeMode();
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
			addEmptyRow();
		}
	}

	function populateTable(data)
	{
		var tableText = "";
		for(var i = 0; i < data.length; i++) {
			tableText += "<tr>";
			for (var j = 0; j < columnNames.length; j++) {
				var cellValue = 
					(data[i][columnNames[j]] !== undefined) ?
					data[i][columnNames[j]] : "";
				tableText += ("<td><div class=\"cell\">" + cellValue + "</div></td>");				
			}
			tableText += "<td><div class=\"cell\">" + deleteButton + "</div></td>";
			tableText += "</tr>";
		}		
		tableBody.append(tableText);
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
		var cell = $(resizer).closest('td');
		var col = $(cell).index();
		return table.find('th:nth-child(' + (col + 1)+ ')');
	}

	function columnCount() {
		return tableBody.children("tr:first-child").children('td').length;
	}	

	function resizeColumn(headerCell, cellWidth, nextCellWidth, tableWidth, difference) {
		var col = $(headerCell).index();
		$(headerCell).css('width', cellWidth + difference);

		if (col == columnCount() - 1) {			
			table.css('width', tableWidth + difference);
		}	

		if (columnCount() > 1 && (col < columnCount() - 1)) {	
			$(headerCell).next('th').css('width', nextCellWidth - difference);
		}
	}

	function activateResizeMode() {
		tableBody.children('tr').each(function() {
			$(this).children('td').each(function() {
				var cellDiv = $(this).find('.cell');
				$(cellDiv).append(resizerLine);				
			});
		});

		$('.left-resizer').on('mouseover', function(){
			$(this).css('cursor', 'ew-resize');
		});

		var xBeforeMove;
		var xAfterMove;
		var borderCaptured = false;
		var capturedHeaderCell;
		var widthBeforeMove;
		var nextWidthBeforeMove;
		var tableWidthBeforeMove;
		$('.left-resizer')
		.on('mousedown', function(e) {			
			xBeforeMove = e.clientX;
			borderCaptured = true;	
			capturedHeaderCell = getHeaderCell(this);
			widthBeforeMove = parseInt($(capturedHeaderCell).css('width'), 10);
			nextWidthBeforeMove = parseInt($(capturedHeaderCell).next('th').css('width'), 10);
			tableWidthBeforeMove = parseInt(table.css('width'), 10);		
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
		tableBody.children('tr').each(function() {
			$(this).children('td').each(function() {
				$(this).find('.left-resizer').remove();							
			});
		});
	}

	const table = $('table');
	const tableBody = table.find('tbody');
	const deleteButton = "<button class=\"delete-btn\">Delete</button>";
	const resizerLine = "<div class=\"left-resizer\"></div>"
	var columnNames = ['name', 'age', 'country'];
	var tableData = [];
	if (localStorage["tableData"]) {
		tableData = JSON.parse(localStorage["tableData"]);
	} 
	else {
		tableData = 
		[{name : "John", age: 29, country : 'USA'},
	 	 {name : "Paul", age: 27, country : 'Germany'},
	 	 {name : "Vladimir", age: 26, country : 'Russia'}]
	}	

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

	$("#loader").on('click', function(event) {
		event.preventDefault();
		$.ajax('/content.html', {
			type: "GET", 
			success: function(result) {				
				$('#content').html(result);
			}
		})
	});

	$("#loader2").on('click', function(event) {
		event.preventDefault();
		window.open('/content.html', "popup", 'height=300,width=300');
	});
});