<?php

class MailResults
{

  const SUCCESS_MSG = 'success';

  const FAIL_MSG = 'failure';

  private $errors = array();

  private $status;


  public function __construct()
  {
    $this->status = self::SUCCESS_MSG;
  }

  public function addError($message)
  {
    if ($this->status !== self::FAIL_MSG)
    {
      $this->status = self::FAIL_MSG;
    }

    $this->errors[] = $message;
  }

  public function hasErrors()
  {
    return count($this->errors) > 0 ? true : false;
  }

  public function jsoninfy()
  {
    return json_encode((object) array('status'=>$this->status, 'errors'=>$this->errors));
  }

  public function setStatus(boolean $isSuccessful)
  {
    if ($isSuccessful === true) {
      $this->status = self::SUCCESS_MSG;
    } else {
      $this->status = self::FAIL_MSG;
    }
  }

};
