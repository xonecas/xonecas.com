var loc = location.pathname.split('/')[1];

require.config({
   baseUrl: '/'
});

loc === "" && require(['js/init']);

loc === "event" && require(['js/init-event']);
