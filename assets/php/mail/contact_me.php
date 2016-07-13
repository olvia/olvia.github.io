<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

require 'class.phpmailer.php';


$name = $_POST['name'];
$email = $_POST['email'];
$message = $_POST['message'];

$mail = new PHPMailer;

$mail->From = 'test@test.com';
$mail->FromName = 'Testname';
$mail->AddAddress('for.me.chova@gmail.com');

$mail->WordWrap = 50;
$mail->IsHTML(true);

$mail->Body = "Name: $name";

$mail->Send();
?>