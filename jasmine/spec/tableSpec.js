describe("Table", function() {
  var tableEdit;
  var tableBody; 
  
  beforeEach(function() {
    tableEdit = new TableEdit();
    tableEdit.table = $("<table>\
    <thead><tr><th>h1</th><th>h2</th><th>h3</th></tr></thead>\
    <tbody><tr><td>1.1</td><td>1.2</td><td>1.3</td></tr>\
    <tr><td>2.1</td><td>2.2</td><td>2.3</td></tr>\
    <tr><td>3.1</td><td>3.2</td><td>3.3</td></tr></tbody>\
    </table>");
    tableBody = tableEdit.getBody();
    //TODO: Get rid of global variables, this is ugly
  });

  it("should return cell index", function() {
    var cell22 = tableEdit.table.find("tr:nth-child(2)").find("td:nth-child(2)");
    expect(cell22.text()).toEqual("2.2");
    var index = tableEdit.cellIndexForElement(cell22);
  
    expect(index.row).toEqual(1);
    expect(index.col).toEqual(1);
  });  

  it("should add empty row", function() {
    expect(tableBody.children("tr").length).toEqual(3);
    tableEdit.addEmptyRow();    
    expect(tableBody.children("tr").length).toEqual(4);
  });  
});
