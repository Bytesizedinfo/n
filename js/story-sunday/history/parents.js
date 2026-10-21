/* Message history — Madam Yu ("Mother") and Jiang Fengmian ("Father"), 2007–2008. Facts: docs/STORY.md */
(function () {
  'use strict';
  const { story } = window.JC;

  story.thread({
    id: 'mom',
    members: ['mom'],
    name: null,
    pinned: false,
    muted: false,
    service: 'sms',
    fails: false,
    history: [
      ['2007-06-27 17:30', 'mom', "Did you arrive."],
      ['2007-06-27 17:45', 'me', "Yes."],
      ['2007-06-27 17:46', 'mom', "Good. Don't embarrass the family in front of the Lans."],
      ['2007-06-29 07:10', 'mom', "Your sister says you left your jacket. Buy one. Don't freeze to prove a point."],
      ['2007-07-10 20:02', 'mom', "I heard Wei Ying was punished. Were you involved."],
      ['2007-07-10 20:15', 'me', "No."],
      ['2007-07-10 20:16', 'mom', "Stand up straight when you lie, at least."],
      ['2007-07-21 18:30', 'mom', "The Lan boy beat you in the exam."],
      ['2007-07-21 18:41', 'me', "By two points."],
      ['2007-07-21 18:42', 'mom', "Two points is two points."],
      ['2007-07-21 18:50', 'mom', "Eat something. You'll study better."],
      ['2007-10-06 14:12', 'mom', "Stand up straight in the photos."],
      ['2007-10-06 14:13', 'me', "I am."],
      ['2007-10-06 14:13', 'mom', "You're slouching. I can see you from here."],
      ['2008-01-20 19:00', 'mom', "Your report came. Acceptable."],
      ['2008-01-20 19:05', 'me', "Just acceptable?"],
      ['2008-01-20 19:06', 'mom', "Don't fish."],
      ['2008-01-20 19:30', 'mom', "Your father framed it. Don't tell him I told you."],
      ['2008-05-15 07:00', 'mom', "Happy birthday. Your present is on your desk. Don't let Wei Ying touch it."],
      ['2008-05-15 07:20', 'me', "It's a watch."],
      ['2008-05-15 07:21', 'mom', "It was your grandfather's. Be on time for once."],
      ['2008-08-23 18:50', 'mom', "Where are you."],
      ['2008-08-23 18:51', 'me', "At the lake pavilion. Wei Wuxian is flying the kite again."],
      ['2008-08-23 18:53', 'mom', "Stay there. Both of you. Don't come home until I call."],
      ['2008-08-23 18:54', 'me', "Why?"],
      ['2008-08-23 18:58', 'mom', "Because I said so."],
    ],
  });

  story.thread({
    id: 'dad',
    members: ['dad'],
    name: null,
    pinned: false,
    muted: false,
    service: 'sms',
    fails: false,
    history: [
      ['2007-06-27 18:05', 'dad', "Arrived safely? Look after Wei Ying. He'll find the trouble first."],
      ['2007-06-27 18:30', 'me', "He can look after himself."],
      ['2007-06-27 18:32', 'dad', "Then look after each other."],
      ['2008-05-15 08:00', 'dad', "Happy birthday, A-Cheng. Sixteen. I'm proud of you. I should say it more."],
      ['2008-05-15 08:15', 'me', "Thanks, Dad."],
      ['2008-08-23 18:52', 'dad', "A-Cheng. Listen to your mother tonight."],
      ['2008-08-23 18:59', 'me', "Dad, what's going on?"],
    ],
  });
})();
