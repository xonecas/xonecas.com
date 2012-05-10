$.domReady(function () {
   var countdown, end;
   moment.relativeTime.future = "%s to go...";
   end = moment('2012-07-0200:51:00 -0800');
   countdown = function () {
      $('#countdownModal').remove();
      $('body').append(templates.countdownModal.render({
         time: moment().from(end)
      }));
   };

   countdown();
   $('body').append(templates.footer.render());
   window.setInterval(function () { countdown(); }, 1000);

   console.log('Hey');
});
