document.addEventListener('DOMContentLoaded', function () {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // submit 
  document.querySelector("#compose-form").addEventListener('submit', SendMail);
  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#display_mail').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}
function display_mail(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Print email
      console.log(email);
      document.querySelector('#display_mail').style.display = 'block';
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#display_mail').innerHTML = `
  <ul class="list-group">
  <li class="list-group-item"><strong>From:</strong>${email.sender}</li>
  <li class="list-group-item"><strong>TO:</strong>${email.recipients}</li>
  <li class="list-group-item"><strong>Subject:</strong>${email.subject}</li>
  <li class="list-group-item"><strong>TimeStamp:</strong>${email.timestamp}</li>
  <br>
  <p>${email.body}</p>
  </ul>
  `;
      if (email.read != true) {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true,
          })
        })
      }
      //archived button
      const btn_archived = document.createElement('button');
      btn_archived.innerHTML = email.archived ? "UnArchive" : "Archive";
      btn_archived.className = email.archived ? "btn btn-primary" : "btn btn-danger";
      btn_archived.addEventListener('click', function () {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: email.archived != true
          })
        })
          .then(() => { load_mailbox('archive') });
      });
      document.querySelector('#display_mail').append(btn_archived);
      //replay on mails
      const btn_Reply = document.createElement('button');
      btn_Reply.innerHTML = "Reply";
      btn_Reply.className = "btn btn-info";
      btn_Reply.addEventListener('click', function () {
        compose_email();
        let subject = email.subject;
        if (subject.charAt(0,2) != "Re:"){
          subject = "Re:" + email.subject;
        }
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = subject; 
        document.querySelector('#compose-body').value = `\r ${email.sender} Reply AT ${email.timestamp} ${email.body} \r ` ;
      }); 
      document.querySelector('#display_mail').append(btn_Reply);
    });


}
function load_mailbox(mailbox) {

  // Show the mailbox and hide other views
  document.querySelector('#display_mail').style.display = 'none';
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  // get mails values out to browser
  fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      //looping mails
      emails.forEach(mail => {
        const New_mail = document.createElement('div');
        if (New_mail.className = mail.read == true) {
          New_mail.innerHTML = `
        <br>
        <div class = "space">
        <div class="read">
        <div class="card-header">
        <h5> Sender : ${mail.sender} </h5>
        subject :<strong> ${mail.subject} </strong> 
        </div>
        <div class="card-body">
          <blockquote class="blockquote mb-0">
            <p>${mail.body}</p>
            <footer class="blockquote-footer">${mail.timestamp}</footer>
          </blockquote>
        </div>
        <span class="span_2">&#10004 seen</span>
      </div>
      </div>
      <hr>
        `}
        if (New_mail.className = mail.read == false) {
          New_mail.innerHTML = `
          <br>
          <div class = "space">
          <div class="unread">
          <div class="card-header">
          <h5> Sender : ${mail.sender} </h5>
          subject :<strong> ${mail.subject} </strong> 
          </div>
          <div class="card-body">
            <blockquote class="blockquote mb-0">
              <p>${mail.body}</p>
              <footer class="blockquote-footer">${mail.timestamp}</footer>
            </blockquote>
          </div>
          <span>&#x2709;UnRead</span>
          </div>
        </div>
        <br>
        <hr>
          `;
        } if (New_mail.className = mail.archived == true) {
          New_mail.innerHTML = `
          <br>
          <div class = "space">
          <div class="card">
          <div class="card-header">
          <h5> Sender : ${mail.sender} </h5>
          subject :<strong> ${mail.subject} </strong> 
          </div>
          <div class="card-body">
            <blockquote class="blockquote mb-0">
              <p>${mail.body}</p>
              <footer class="blockquote-footer">${mail.timestamp}</footer>
            </blockquote>
          </div>
          <span>📥Archived</span>
          </div>
        </div>
        <br>
        <hr>
          `;
        }
        //background chang on click to read
        //click function
        New_mail.addEventListener('click', function () {
          display_mail(mail.id)
        });
        document.querySelector('#emails-view').append(New_mail);
      })
      // ... do something else with emails ...
    });
}

// sending_mail function
function SendMail(event) {
  event.preventDefault();
  //Storage Labels
  const params = {
    recipients: document.querySelector('#compose-recipients').value,
    subject: document.querySelector('#compose-subject').value,
    body: document.querySelector('#compose-body').value,
  }

  //Post mail data
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: params.recipients,
      subject: params.subject,
      body: params.body,
    })
  })
    .then(response => response.json())
    .then(result => {
      // Print result
      console.log(result);
      load_mailbox('sent');
    });

}
