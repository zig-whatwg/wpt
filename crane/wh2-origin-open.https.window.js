// META: script=/common/get-host-info.sub.js
const popup = window.open(get_host_info().OTHER_ORIGIN + "/crane/wh2-origin-open-target.html");
fetch_tests_from_window(popup);
