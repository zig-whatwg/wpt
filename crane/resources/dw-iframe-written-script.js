var probe = document.documentElement.getAttribute("data-probe");
parent.writtenScripts.push(probe);
document.write("<script>parent.writtenScripts.push(" + JSON.stringify(probe + ":nested") + ");<\/script>");
