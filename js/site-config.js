/* Duo site — editable settings for the founder's note and careers pages. */

window.DUO_SITE = {
  contactEmail: "duowalkie@gmail.com",
  careersEmail: "duowalkie@gmail.com",

  // Careers form delivery (FormSubmit). The first submission sends an
  // activation email to this inbox; forms deliver only after it's confirmed.
  // Set to "" to skip sending and only offer Gmail / email-app buttons.
  formEndpoint: "https://formsubmit.co/ajax/duowalkie@gmail.com",

  // Optional support on the founder's note. Set `enabled: false` to hide it.
  // The homepage coffee button links to the same page from index.html.
  support: {
    enabled: true,
    buyMeACoffee: "https://buymeacoffee.com/shivanshch7",
  },
};
