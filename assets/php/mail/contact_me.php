<?
if((isset($_POST['name'])&&$_POST['name']!="")&&(isset($_POST['email'])&&$_POST['email']!="")&&(isset($_POST['message'])&&$_POST['message']!="")){ //Проверка отправилось ли наше поля name и не пустые ли они
        $to = 'for.me.chova@gmail.com'; 
        $subject = 'Письмо с сайта'; 
        $message = '
                <html>
                    <head>
                        <title>'.$subject.'</title>
                    </head>
                    <body>
                        <p>Имя: '.$_POST['name'].'</p>
                        <p>E-mail: '.$_POST['email'].'</p>    
                        <p>Сообщение: '.$_POST['message'].'</p>                      
                    </body>
                </html>'; /
        $headers  = "Content-type: text/html; charset=utf-8 \r\n"; 
        $headers .= "From: Отправитель <from@example.com>\r\n"; 
        mail($to, $subject, $message, $headers); 
}
?>